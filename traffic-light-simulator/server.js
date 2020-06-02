const fetch = require("node-fetch");
const amqp = require('amqplib/callback_api');

var crosswalks = [];
var channel = null;
const exchange = 'private'
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
        crosswalk_id: crosswalk.id,
        light: colors[iter%3],
    }
    //send information to the queue
    const key = `${crosswalk.id}.light.update`;
    const msg = JSON.stringify(crosswalkTL);
    channel.publish(exchange, key, Buffer.from(msg));
    console.log(" [x] Sent %s", msg);
  });
  iter=(++iter)%3;
  setTimeout(sendInformation,5000)
};



/**
 * Starts connection with rabbitmq
 */
function startConnection(){
  const url=`amqp://${rabbit}`
  amqp.connect(url, (connError, connection) => {
    if(connError){
      throw connError;
    }
    //Create Channel
    connection.createChannel((channelError, ch) => {
      if(channelError){
        throw channelError;
      }
      ch.assertExchange(exchange, 'topic', {
        durable: true
      });
      channel = ch;
    });
  });
};


  console.log(`App started`);
  getCrosswalks();
  startConnection();
  setTimeout(sendInformation,5000);
