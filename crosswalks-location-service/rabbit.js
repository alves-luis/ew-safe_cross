const amqp = require('amqplib');

var ch = null;

async function init() {
  if (ch == null) {
    const rabbit = `${process.env.RABBIT_HOSTNAME}`;
    const con = await amqp.connect(`amqp://${rabbit}`);
    ch = await con.createChannel();
  }
  return ch;
}

async function publishNewCrossalk(crosswalkId) {
  try {
    const ch = await init();
    const exchange = 'private';
    const key = `${crosswalkId}.new`;

    const msg = {
      crosswalk_id: crosswalkId
    };

    ch.assertExchange(exchange, 'topic', { durable: true });
    ch.publish(exchange, key, Buffer.from(JSON.stringify(msg)));

    console.log('published new crosswalk with id ' + crosswalkId);
  } catch (error) {
    console.log(error, 'Unable to connect to rabbit');
  }
}

module.exports = {
  publish: publishNewCrossalk
}