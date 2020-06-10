const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib/callback_api');



function simulator(){

  const info1={veh_id:11, crosswalk_id:'eeebf21e-ceec-423d-899d-fe92564b7f79' };
  const info3={veh_id:11, crosswalk_id:'eeebf21e-ceec-423d-899d-fe92564b7f79' };
  const info2={ped_id:44, crosswalk_id:'68346ef5-2ab8-48ac-a90a-c69b13d627e3' };
  const info4={ped_id:45, crosswalk_id:'68346ef5-2ab8-48ac-a90a-c69b13d627e3' };
  const info5={veh_id:6, crosswalk_id:'68346ef5-2ab8-48ac-a90a-c69b13d627e3' };


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
  console.log(getInfo('eeebf21e-ceec-423d-899d-fe92564b7f79'));
  console.log(getInfo('68346ef5-2ab8-48ac-a90a-c69b13d627e3'));
}
