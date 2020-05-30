const chai = require('chai');
const amqp = require('amqplib/callback_api');
const assert = chai.assert;

const rabbit = `${process.env.RABBIT_HOSTNAME}`



function produce_faker(con, client, action) {
  con.createChannel((err, ch) => {
    const exchange = 'private';
    const key = `d9ac8071-9e12-4969-ba86-0b7978737117.${client}.${action}`;

    if (err) {
      console.log(`Could not create Channel to produce to ${key}`);
      console.log(err);
      throw err;
    }

    ch.assertExchange(exchange, 'topic', { durable: true });

    let obj;
    if (client == 'vehicle')
      obj = {
        ped_id: '4823-4jhajkhdk-sajdkasd',
        crosswalk_id: 'd9ac8071-9e12-4969-ba86-0b7978737117'
      };
    else 
      obj = {
        veh_id: '9898234798237-4jhajkhdk-saejfaskjhdf',
        crosswalk_id: 'd9ac8071-9e12-4969-ba86-0b7978737117'
      };

    const status_msg = JSON.stringify(obj);

    ch.publish(exchange, key, Buffer.from(status_msg));
    console.log(`published with key (${key}): ${status_msg}`);
  });
}


//setTimeout(() => produce_faker(con, 'vehicle', 'near'), 3000);
//setTimeout(() => produce_faker(con, 'pedestrian', 'near'), 3000);
//setTimeout(() => produce_faker(con, 'vehicle', 'far'), 3000);
//setTimeout(() => produce_faker(con, 'pedestrian', 'far'), 3000);