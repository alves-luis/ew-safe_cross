const fetch = require("node-fetch");
const amqp = require('amqplib/callback_api');

const crosswalks = [];
const channel = null;
const exchange = 'private'
const iter = 0;
const colors = ["green","yellow","red"];
const crosswalk_location = process.env.CROSSWALKS_LOCATION_SERVICE_HOSTNAME;
const rabbit = process.env.RABBIT_HOSTNAME;


//Get all crosswalk in the system
async function getCrosswalks () {
  await fetch('http://${crosswalks_location}/v1/crosswalks/')
    .then( async (response) => {
        const resp = await response.json();
        crosswalks=crosswalks.concat(resp.crosswalks);
    })
    .catch((reason) => {
       console.log(reason);
    });
};


// For each crosswalk, adds the light color and publishes to the queue
function sendInformation () {
  //Give signal color
  crosswalks.forEach(crosswalk => {
    const crosswalkTL = {
        crosswalk_id: crosswalk.id,
        light: colors[iter%3],
    }
    //send information to the queue
    const key = `${crosswalk.id}.light.update`;
    console.log(key);
    const msg = JSON.stringify(crosswalkTL);
    channel.publish(exchange, key, Buffer.from(msg));
    console.log(" [x] Sent %s", msg);
  });
  iter=(++iter)%3;
  setTimeout(sendInformation,5000)
};


//Starts connection with rabbitmq
function startConnection(){
  amqp.connect('amqp://${rabbit}', (connError, connection) => {
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


function simulate(){
  getCrosswalks();
  startConnection();
  setTimeout(sendInformation,5000);
}


  console.log(`App started`);
  
  //waiting for the other services to start
  setTimeout(simulate,5000);
