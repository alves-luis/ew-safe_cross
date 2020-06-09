'use strict';

const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib/callback_api');
const CrosswalksHistory = require('./models/CrosswalksHistory');


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

/**
 * Consumes information with key="*.client.near"
 */
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
             console.log(" Message received '%s'", message);
        }, {
          noAck: false
        });
      });
    });
  });
}

/**
 * Given a message, adds the information to the database
 */
async function addCrosswalkHistory(message){

  let client = 'vehicle';
  let client_id = message.veh_id;
  if("ped_id" in message){
    client = 'pedestrian';
    client_id = message.ped_id;
  }
  const update = {$push: {history: { client: { id: client_id, kind: client }, crossedAt:Date.now()}}};
  console.log("UPDATE");
  console.log(update);
  try{
    const crosswalkHistory = await CrosswalksHistory.findOneAndUpdate({crosswalk_id: message.crosswalk_id}, update, {
      new: true,
      upsert: true
    });
    console.log("ADICIONADO");
    console.log(crosswalkHistory);
  }
  catch (error){
    console.log(error);
  }
}

/**
 * Given a crosswalk id, gets the number of pedestrians and vehicles that were on that crosswalk in the last 24 hours
 */
async function getInfo(id){
  let crosswalkHistory = [];
  let numPed = 0;
  let numVeh = 0;
  const day = 86400000;
  const today = new Date(Date.now());
  const yesterday = new Date(Date.now() - day);
  const filter = { "crosswalk_id": id, "history.crossedAt": {$gte: yesterday , $lt: today}};
  try{
  //  crosswalkHistory = await CrosswalksHistory.findOne(filter,"history.id history.kind");
    crosswalkHistory = await CrosswalksHistory.aggregate([
      {$match: {crosswalk_id: id}},
      {$project: {history:1}},
      {$unwind: '$history'},
      {$match: {"history.crossedAt": {$gte: yesterday , $lt: today}}},
      {$group: {_id:'$history.client.id'}},
    ])
    console.log("É ISTO QUE QUEREMOS");
    console.log(crosswalkHistory);
    crosswalkHistory.forEach(crosswalk => {
      console.log("Crosswalk HISTORY");
      console.log(crosswalk.history);
      crosswalk.history.forEach(function(info){
        console.log("Crosswalk Client");
        console.log(info.client.kind);
        if(info.client.kind == 'pedestrian'){
          numPed++;
        }
        else{
          numVeh++;
        }
      });
    });
  }
  catch (error){
    console.log(error);
  }
  const result = {num_ped: numPed, num_veh: numVeh}
  return JSON.stringify(result);
}


/**
 * Simulator
 */

function simulator(){

  const info1={ped_id:11, crosswalk_id:'8e1d9202-8c15-4bc9-a07a-6ac16ca8d51b' };
  const info3={ped_id:11, crosswalk_id:'8e1d9202-8c15-4bc9-a07a-6ac16ca8d51b' };
  const info2={veh_id:44, crosswalk_id:'8e1d9202-8c15-4bc9-a07a-6ac16ca8d51b' };
  const info4={veh_id:45, crosswalk_id:'8e1d9202-8c15-4bc9-a07a-6ac16ca8d51b' };
  const info5={ped_id:6, crosswalk_id:'8e1d9202-8c15-4bc9-a07a-6ac16ca8d51b' };


  const exchange = 'private';
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
      const msg1 = JSON.stringify(info1);
      const msg2 = JSON.stringify(info2);
      const msg3 = JSON.stringify(info3);
      const msg4 = JSON.stringify(info4);
      const msg5 = JSON.stringify(info5);

      ch.publish(exchange, key1, Buffer.from(msg1));
      ch.publish(exchange, key1, Buffer.from(msg2));
      ch.publish(exchange, key1, Buffer.from(msg3));
      ch.publish(exchange, key1, Buffer.from(msg4));
      ch.publish(exchange, key1, Buffer.from(msg5));
      console.log(" MANDEIII Sent %s", msg1);
    });
  });
};


function seeInfo(){
  console.log(getInfo('a362db8a-cfb5-4040-94e2-39ffa6cd96cc'));
}



app.get('/v1/crosswalks/:id', (req, res) => {
  const id = req.params.id;
  getInfo(id).then((st) => {
      const status = JSON.parse(st);
      if (status.num_ped!= undefined && status.num_veh!= undefined) {
        res.status(200);
        res.json({
          num_ped: status.num_ped,
          num_veh: status.num_veh,
        });
      } else {
        res.sendStatus(404);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});


const server = app.listen(3000, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`App listening at http://${host}:${port}`);
  consumeInformation('pedestrian');
  consumeInformation('vehicle');
  setTimeout(simulator,5000);
  setTimeout(seeInfo,8000);
});

module.exports = () => start();
