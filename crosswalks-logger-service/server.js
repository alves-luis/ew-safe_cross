'use strict';

const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib/callback_api');
const routes = require('./routes');
const CrosswalksHistory = require('./models/CrosswalksHistory');


const app = express();

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

var channel = null;
const exchange = 'private';

const uri = `mongodb://${username}:${password}@${host}:${port}/${database}`;
mongoose.connect(uri, options).catch((error) => {
  console.log(error);
});


function consumeInformation (client) {

  const key = `*.${client}.near`;

  amqp.connect('amqp://rabbit', function(error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function(error1, channel) {
      if (error1) {
        throw error1;
      }
      channel.assertExchange(exchange, 'topic', {durable: true});
      channel.assertQueue(
        '',
        {exclusive: true, autoDelete: true, durable: true },
        (error2, q) => {
          if (error2) {
            console.log(`Could not assert queue to consume ${key}`);
          }
          channel.bindQueue(q.queue, exchange, key);
          console.log(` Now consuming key (${key})`);
          //consumes message
          channel.consume(q.queue, function(msg) {
             const message = JSON.parse(msg.content.toString());
             addCrosswalkHistory(message);
             //console.log(new Date(Date.now() - 86400000));
            console.log(" OLHA O QUE RECEBI: [x] '%s'", message);
        }, {
          noAck: false
        });
      });
    });
  });
}


async function addCrosswalkHistory(message){
  const crosswalksHistory = new CrosswalksHistory({crosswalk_id: message.crosswalk_id, pedestrian_id: message.ped_id ,timestamp: Date.now()});
  try{
    await crosswalksHistory.save(function (err, data) {
      if (err) throw err;
      console.log("New info added inserted");
    });
  }
  catch (error){
    console.log(error);
  }

}

/**
 * Simulator
 */
function simulator(){

  const info={ped_id:11, crosswalk_id: 1};
  const exchange = 'private';
  const id= 1

  amqp.connect('amqp://rabbit', (connError, connection) => {
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
      const key1 = `1.pedestrian.near`;
      const msg1 = JSON.stringify(info);

      ch.publish(exchange, key1, Buffer.from(msg1));
      console.log(" MANDEIII Sent %s", msg1);
    });
  });
};




const server = app.listen(8030, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`App listening at http://${host}:${port}`);
  consumeInformation('pedestrian');

  setTimeout(simulator,5000);


});

module.exports = () => start();
