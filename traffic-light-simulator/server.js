const fetch = require("node-fetch");
const amqp = require('amqplib/callback_api');

var crosswalks = [];
var channel;
var exchange = 'private'
var iter = 0;
const colors = ["green","yellow","red"];


//Get all crosswalk in the system
async function getCrosswalks () {
  await fetch('http://crosswalks_location_service:3000/v1/crosswalks/')
    .then( async (response) => {
        const resp = await response.json();
        crosswalks=crosswalks.concat(resp.crosswalks);
    })
    .catch((reason) => {
       console.log(reason);
    });
};


// For each crosswalk, adds the light color and pushishes to the queue
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
    var msg = JSON.stringify(crosswalkTL);
    channel.publish(exchange, '', Buffer.from(msg));
    console.log(" [x] Sent %s", msg);
  });
  iter=(++iter)%3;
};


//Starts connection with rabbitmq
function startConnection(){
  amqp.connect('amqp://rabbit', (connError, connection) => {
    if(connError){
      throw connError;
    }
    //Create Channel
    connection.createChannel((channelError, ch) => {
      if(channelError){
        throw channelError;
      }
      ch.assertExchange(exchange, 'direct', {
        durable: true
      });
      channel = ch;
    });
  });
};


function simulate(){
  startConnection();
  setInterval(sendInformation,5000);
}


  console.log(`App started`);
  //waiting for the other services to start
  setTimeout(getCrosswalks,5000);
  setTimeout(simulate,30000);
