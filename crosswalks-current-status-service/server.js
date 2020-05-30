require('dotenv').config();
const mongoose = require('mongoose');
const CrosswalkStatus = require('./models/CrosswalkStatus');
const amqp = require('amqplib/callback_api');

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
};

const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const database = process.env.DB_DATABASE;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

const uri = `mongodb://${username}:${password}@${host}:${port}/${database}`;
mongoose.connect(uri, options).
  catch(error => {
    console.log(error);
  });

const rabbit = `${process.env.RABBIT_HOSTNAME}`
amqp.connect(`amqp://${rabbit}`, (err, con) => {
  if (err) {
    console.log(err);
    throw err;
  }

  consume_client(con, 'pedestrian', 'near');
  consume_client(con, 'pedestrian', 'far');
  consume_client(con, 'vehicle', 'near');
  consume_client(con, 'vehicle', 'far');
});

// retrieves the current status of the crosswalk
async function get_crosswalk_current_status(crosswalk_id) {
  let crosswalkStatus;
  const filter = { uid: crosswalk_id };
  try {
    crosswalkStatus = await CrosswalkStatus.findOneAndUpdate(filter, filter, { upsert: true, new: true });
  }
  catch (err) {
    console.log('Could not get current Crosswalk Status ' + err);
  }

  const status = {
    light: crosswalkStatus.light,
    num_peds: crosswalkStatus.num_pedestrians,
    num_vehs: crosswalkStatus.num_vehicles
  };
  return JSON.stringify(status);
}

// Given a crosswalk_id, an inc_value and a client_field, updates the crosswalk status
// if inc_value = -1, it decreases the client_field. If 1, it increases
// Valid client_fields: num_pedestrians; num_vehicles
async function update_count_in_crosswalk(crosswalk_id, inc_value, client_field) {
  let increment = {};
  increment[client_field] = inc_value;
  try {
    await CrosswalkStatus.findOneAndUpdate(
        { uid: crosswalk_id },
        { $inc: increment}
      );
  }
  catch (err) {
    if (inc_value < 0) {
      console.log(`Could not decrease ${client_field} from ${crosswalk_id}`);
    }
    else {
      console.log(`Could not increase ${client_field} to ${crosswalk_id}`);
    }
    console.log(err);
  }
}

// Given a crosswalk_id, send a message to subscribers with current crosswalk status
function produce_crosswalk_status_short(con, crosswalk_id) {
  con.createChannel((err, ch) => {
    const exchange = 'public';
    const key = `${crosswalk_id}.status.short`;

    if (err) {
      console.log(`Could not create Channel to produce to ${key}`);
      console.log(err);
      throw err;
    }

    ch.assertExchange(exchange, 'topic', { durable: true });

    get_crosswalk_current_status(crosswalk_id)
      .then(status_msg => {
          console.log(`Published ${status_msg}`);
          ch.publish(exchange, key, Buffer.from(status_msg));
        }
      );
  });
}

// Given an action, activates a consumer with the key *.<client>.<action>
// clients: vehicle or pedestrian
// actions: near or far
function consume_client(con, client, action) {
  con.createChannel((err, ch) => {
    if (err) {
      console.log(err);
      throw err;
    }

    const exchange = 'private';
    const key = `*.${client}.${action}`;
    const inc_value = (action == 'near') ? 1 : -1;
    const client_field = `num_${client}s`;

    ch.assertExchange(exchange, 'topic', { durable: true });

    ch.assertQueue('', { exclusive: true, autoDelete: true, durable: true }, (err, q) => {
      if (err) {
        console.log(`Could not assert queue to consume ${key}`);
      }

      ch.bindQueue(q.queue, exchange, key);
      
      console.log(`Now consuming key (${key})`);
      ch.consume(q.queue, (msg) => {
        const who = JSON.parse(msg.content.toString());
        update_count_in_crosswalk(who.crosswalk_id, inc_value, client_field)
          .then( () => {
            console.log(`consumed: ${JSON.stringify(who)}`);
            ch.ack(msg);
            produce_crosswalk_status_short(con, who.crosswalk_id);
          });
      });
    });
  });
}
