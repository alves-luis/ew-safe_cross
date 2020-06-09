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
const rabbit = process.env.RABBIT_HOSTNAME;


const uri = `mongodb://${username}:${password}@${host}:${port}/${database}`;
mongoose.connect(uri, options).catch((error) => {
  console.log(error);
});

/**
 * Starts the connection with rabbit
 */
function startConnection(){

  const exchange = 'private';
  const url=`amqp://${rabbit}`

  amqp.connect(url, function(error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function(error1, channel) {
      if (error1) {
        throw error1;
      }
      channel.assertExchange(exchange, 'topic', {durable: true});
      consumeInformation(channel, exchange, 'pedestrian');
      consumeInformation(channel, exchange, 'vehicle');
    });
  });
};

/**
 * Consumes information with key="*.client.near"
 */
function consumeInformation(channel, exchange, client) {

  const key = `*.${client}.near`;

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
         console.log(" Message received '%s'", message);
         addCrosswalkHistory(message);
    }, {
      noAck: false
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
  try{
    const crosswalkHistory = await CrosswalksHistory.findOneAndUpdate({crosswalk_id: message.crosswalk_id}, update, {
      new: true,
      upsert: true
    });
    console.log("New information added to history!");
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
  const now = new Date();
  const midnight = new Date(now.getFullYear(),now.getMonth(),now.getDate());
  try{
    crosswalkHistory = await CrosswalksHistory.aggregate([
      {$match: {crosswalk_id: id}},
      {$project: {history:1}},
      {$unwind: '$history'},
      {$match: {"history.crossedAt": {$gte: midnight , $lt: now}}},
      {$group: {_id: { id: '$history.client.id', type: '$history.client.kind' }}},
    ]);
      crosswalkHistory.forEach(function(entry){
        if(entry._id.type == 'pedestrian'){
          numPed++;
        }
        else{
          numVeh++;
        }
      });
  }
  catch (error){
    console.log(error);
  }
  const result = {num_ped: numPed, num_veh: numVeh}
  console.log(result);
  return JSON.stringify(result);
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
  startConnection();
  setTimeout(simulator,5000);
  setTimeout(seeInfo,8000);
});

module.exports = () => start();
