const fetch = require("node-fetch");
const amqp = require('amqplib/callback_api');

var crosswalks = [];
let channel;
const exchange = 'private';
var iter = 0;
const colors = ["green","yellow","red"];
const crosswalk_location = process.env.CROSSWALKS_LOCATION_SERVICE_HOSTNAME;
const rabbit = process.env.RABBIT_HOSTNAME;


/**
 * Gets all the crosswalks from crosswalks_location_service
 */
async function getCrosswalks () {
  const url = `http://${crosswalk_location}/v1/crosswalks/`;
  await fetch(url)
    .then( async (response) => {
        const resp = await response.json();
        crosswalks=crosswalks.concat(resp.crosswalks);
    })
    .catch((reason) => {
       console.log(reason);
    });
};


/**
 * For each crosswalk, adds the light color and publishes it to the queue
 */
function sendInformation () {
  //Give signal color
  crosswalks.forEach(crosswalk => {
    const crosswalkTL = {
        crosswalk_id: crosswalk.crosswalk_id,
        light: colors[iter%3],
    }
    //send information to the queue
    const key = `${crosswalk.crosswalk_id}.light.update`;
    const msg = JSON.stringify(crosswalkTL);
    channel.publish(exchange, key, Buffer.from(msg));
    console.log(" [x] Sent %s", msg);
  });
  iter=(++iter)%3;
  setTimeout(sendInformation,5000);
};

/**
 * Receives new crosswalks to generate a traffic light color
 */
function updateCrosswalks() {

  const key = `*.new`;

  channel.assertQueue(
    '',
    {exclusive: true, autoDelete: true, durable: true },
    (error2, q) => {
      if (error2) {
        console.log(`Could not assert queue to consume ${key}`);
      }

      channel.bindQueue(q.queue, exchange, key);
      console.log(` Now consuming key (${key})`);
      channel.consume(q.queue, function(msg) {
        const message = JSON.parse(msg.content.toString())
        crosswalks.push(message);
        console.log(" New crosswalk added '%s'", message.crosswalk_id);
    }, {
      noAck: true
    });
  });
};


/**
 * Starts connection with rabbitmq
 */
function startConnection(){
  const url=`amqp://${rabbit}`
  amqp.connect('amqp://rabbit', function(error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function(error1, ch) {
      if (error1) {
        throw error1;
      }
      ch.assertExchange(exchange, 'topic', {
        durable: true
      });
      channel = ch;
        updateCrosswalks();
        sendInformation();
    });
  });
};

console.log(`App started`);
getCrosswalks();
startConnection();
