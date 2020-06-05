const amqp = require('amqplib');

const publishNewCrossalk = async (crosswalkId) => {
  try {
    const rabbit = `${process.env.RABBIT_HOSTNAME}`;
    console.log(rabbit);
    const con = await amqp.connect(`amqp://${rabbit}`);
    const ch = await con.createChannel();
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
    process.exit(1);
  }
}

module.exports = publishNewCrossalk;