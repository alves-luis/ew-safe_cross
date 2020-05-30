const express = require('express');
const app = express();
const fetch = require("node-fetch");
const amqp = require('amqplib/callback_api');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var crosswalks = [{id:1, lon:12, lat:24 ,creation_date:'1313'}] ;
var channel;
var exchange = 'traffic_light'
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
        id: crosswalk.id,
        light: colors[iter%3],
    }
    //send information to the queue
    var msg = JSON.stringify(crosswalkTL);
    channel.publish(exchange, '', Buffer.from(msg));
    console.log(" [x] Sent %s", msg);
  });
  iter++;
};


//Starts connection with rabbitmq
function startConnection(){
  amqp.connect('amqp://ew-safe_cross_rabbit_1', (connError, connection) => {
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

const server = app.listen(8082, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`App listening at http://${host}:${port}`);

  //waiting for the other services to start
  setTimeout(getCrosswalks,5000);
  setTimeout(simulate,30000);

});

module.exports = app;
