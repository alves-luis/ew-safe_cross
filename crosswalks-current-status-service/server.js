require('dotenv').config();
const mongoose = require('mongoose');
const amqp = require('amqplib/callback_api');
const CrosswalkStatus = require('./models/CrosswalkStatus');

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const database = process.env.DB_DATABASE;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

const uri = `mongodb://${username}:${password}@${host}:${port}/${database}`;
mongoose.connect(uri, options).catch((error) => {
  console.log(error);
});

/**
 * Retrieves the current status of the crosswalk
 * @param {string} crosswalkId
 */
async function getCrosswalkCurrentStatus(crosswalkId) {
  let crosswalkStatus;
  const filter = { uid: crosswalkId };
  try {
    crosswalkStatus = await CrosswalkStatus.findOneAndUpdate(filter, filter, {
      upsert: true,
      new: true,
    });
  } catch (err) {
    console.log(`Could not get current Crosswalk Status ${err}`);
  }

  const status = {
    light: crosswalkStatus.light,
    num_peds: crosswalkStatus.num_pedestrians,
    num_vehs: crosswalkStatus.num_vehicles,
  };
  return JSON.stringify(status);
}

/**
 * Update the crosswalk status given those params
 * Valid inc_values: -1, 1
 * Valid client_fields: num_pedestrians; num_vehicles
 * @param {string} crosswalkId
 * @param {number} incValue
 * @param {string} clientField
 */
async function updateCountInCrosswalk(crosswalkId, incValue, clientField) {
  const increment = {};
  increment[clientField] = incValue;
  try {
    await CrosswalkStatus.findOneAndUpdate(
      { uid: crosswalkId },
      { $inc: increment },
      { upsert: true, new: true },
    );
  } catch (err) {
    if (incValue < 0) {
      console.log(`Could not decrease ${clientField} from ${crosswalkId}`);
    } else {
      console.log(`Could not increase ${clientField} to ${crosswalkId}`);
    }
    console.log(err);
  }
}

/**
 * Given the id, and the new light, update DB
 * @param {string} crosswalkId
 * @param {string} light
 */
async function updateLightInCrosswalk(crosswalkId, light) {
  const filter = { uid: crosswalkId };
  const update = { uid: crosswalkId, light };
  try {
    await CrosswalkStatus.findOneAndUpdate(filter, update, {
      upsert: true,
      new: true,
    });
  } catch (err) {
    console.log(`Could not update Crosswalk Status Light ${err}`);
  }
}

/**
 * Given an id, produce a status message to subscribers
 * @param {amqp.connection} con
 * @param {string} crosswalkId
 */
function produceCrosswalkStatusShort(ch, crosswalkId) {
    const exchange = 'public';
    const key = `${crosswalkId}.status.short`;

    ch.assertExchange(exchange, 'topic', { durable: true });

    getCrosswalkCurrentStatus(crosswalkId).then((statusMsg) => {
      console.log(
        `Published ${statusMsg} with key ${key} to exchange ${exchange}`,
      );
      ch.publish(exchange, key, Buffer.from(statusMsg));
    });
}

/**
 * Given these params, activates a consumer with
 * key *.<client>.<action>
 * Valid clients: vehicle; pedestrian
 * Valid actions: near; far
 * @param {amqp.connection} con
 * @param {string} client
 * @param {string} action
 */
function consumeClient(con, client, action) {
  con.createChannel((err, ch) => {
    if (err) {
      console.log(err);
      throw err;
    }

    const exchange = 'private';
    const key = `*.${client}.${action}`;
    const incValue = action === 'near' ? 1 : -1;
    const clientField = `num_${client}s`;

    ch.assertExchange(exchange, 'topic', { durable: true });

    ch.assertQueue(
      '',
      { exclusive: true, autoDelete: true, durable: true },
      (err2, q) => {
        if (err2) {
          console.log(`Could not assert queue to consume ${key}`);
        }

        ch.bindQueue(q.queue, exchange, key);

        console.log(`Now consuming key (${key})`);
        ch.consume(q.queue, (msg) => {
          const who = JSON.parse(msg.content.toString());
          updateCountInCrosswalk(who.crosswalk_id, incValue, clientField).then(
            () => {
              console.log(`consumed: ${JSON.stringify(who)}`);
              ch.ack(msg);
              produceCrosswalkStatusShort(ch, who.crosswalk_id);
            },
          );
        });
      },
    );
  });
}

/**
 * Activates a consumer with key: *.light.update
 * @param {amqp.connection} con
 */
function consumeLightStatus(con) {
  con.createChannel((err, ch) => {
    if (err) {
      console.log(err);
      throw err;
    }

    const exchange = 'private';
    const key = '*.light.update';

    ch.assertExchange(exchange, 'topic', { durable: true });

    ch.assertQueue(
      '',
      { exclusive: true, autoDelete: true, durable: true },
      (err2, q) => {
        if (err2) {
          console.log(`Could not assert queue to consume ${key}`);
        }

        ch.bindQueue(q.queue, exchange, key);

        console.log(`Now consuming key (${key})`);
        ch.consume(q.queue, (msg) => {
          const update = JSON.parse(msg.content.toString());
          updateLightInCrosswalk(update.crosswalk_id, update.light).then(() => {
            console.log(`consumed: ${JSON.stringify(update)}`);
            ch.ack(msg);
            produceCrosswalkStatusShort(ch, update.crosswalk_id);
          });
        });
      },
    );
  });
}

function createPublicExchange(con) {
  con.createChannel((err, ch) => {
    if (err) {
      console.log(err);
      throw err;
    }

    const exchange = 'public';

    ch.assertExchange(exchange, 'topic', { durable: true });
    ch.close();
  })
}

/**
 * Function that starts the callbacks
 */
function start() {
  const rabbit = `${process.env.RABBIT_HOSTNAME}`;
  amqp.connect(`amqp://${rabbit}`, (err, con) => {
    if (err) {
      console.log(err);
      throw err;
    }

    createPublicExchange(con);

    consumeClient(con, 'pedestrian', 'near');
    consumeClient(con, 'pedestrian', 'far');
    consumeClient(con, 'vehicle', 'near');
    consumeClient(con, 'vehicle', 'far');
    consumeLightStatus(con);
  });
}

start();

module.exports = () => start();
