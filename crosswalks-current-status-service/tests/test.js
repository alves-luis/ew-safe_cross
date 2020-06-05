const assert = require('assert');
const amqp = require('amqplib');
require('../server');

/**
 * Produce a message to the given channel, with
 * given key and with stringified message
 * @param {amqp.connection} con
 * @param {string} exchange
 * @param {string} key
 * @param {object} message
 */
async function produceMessage(con, exchange, key, message) {
  try {
    const ch = await con.createChannel();
    await ch.assertExchange(exchange, 'topic', { durable: true });
    const msg = JSON.stringify(message);
    await ch.publish(exchange, key, Buffer.from(msg));
    console.log(`test published with key (${key}): ${msg}`);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

/**
 * Listen for a single message in the given
 * exchange with the given key
 * @param {amqp.connection} con
 * @param {string} exchange
 * @param {string} key
 */
async function consumeMessage(con, exchange, key) {
  try {
    const ch = await con.createChannel();
    await ch.assertExchange(exchange, 'topic', { durable: true });
    const q = await ch.assertQueue('', { exclusive: true, autoDelete: true });
    await ch.bindQueue(q.queue, exchange, key);
    return new Promise((resolve) => {
      ch.consume(q.queue, (msg) => {
        console.log(`test consumed: ${msg.content.toString()}`);
        ch.ack(msg);
        ch.close();
        return resolve(JSON.parse(msg.content.toString()));
      });
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
}

const rabbit = `${process.env.RABBIT_HOSTNAME}`;

describe('Test integration with pedestrian notifications', () => {
  let con;
  before(async () => {
    con = await amqp.connect(`amqp://${rabbit}`);
  });

  it('Publish a message with pedestrian entering the crosswalk', (done) => {
    consumeMessage(con, 'public', 'fakeCID.status.short')
      .then((r) => {
        assert.equal(r.num_peds, 1);
        done();
      })
      .catch((err) => done(err));

    const msg = {
      ped_id: 'fakePID',
      crosswalk_id: 'fakeCID',
    };
    produceMessage(con, 'private', 'fakeCID.pedestrian.near', msg);
  });

  it('Publish a message with pedestrian leaving the crosswalk', (done) => {
    consumeMessage(con, 'public', 'fakeCID.status.short')
      .then((r) => {
        assert.equal(r.num_peds, 0);
        done();
      })
      .catch((err) => done(err));

    const msg = {
      ped_id: 'fakePID',
      crosswalk_id: 'fakeCID',
    };
    produceMessage(con, 'private', 'fakeCID.pedestrian.far', msg);
  });
});

describe('Test integration with vehicle notifications', () => {
  let con;
  before(async () => {
    con = await amqp.connect(`amqp://${rabbit}`);
  });

  it('Publish a message with vehicle entering the crosswalk', (done) => {
    consumeMessage(con, 'public', 'fakeCID.status.short')
      .then((r) => {
        assert.equal(r.num_vehs, 1);
        done();
      })
      .catch((err) => done(err));

    const msg = {
      veh_id: 'fakeVID',
      crosswalk_id: 'fakeCID',
    };
    produceMessage(con, 'private', 'fakeCID.vehicle.near', msg);
  });

  it('Publish a message with vehicle leaving the crosswalk', (done) => {
    consumeMessage(con, 'public', 'fakeCID.status.short')
      .then((r) => {
        assert.equal(r.num_vehs, 0);
        done();
      })
      .catch((err) => done(err));

    const msg = {
      veh_id: 'fakeVID',
      crosswalk_id: 'fakeCID',
    };
    produceMessage(con, 'private', 'fakeCID.vehicle.far', msg);
  });
});

describe('Test integration with traffic light notifications', () => {
  let con;
  before(async () => {
    con = await amqp.connect(`amqp://${rabbit}`);
  });

  it('Update traffic light status', (done) => {
    const colors = ['green', 'yellow', 'red'];
    const i = Math.floor(Math.random() * 3);
    consumeMessage(con, 'public', 'fakeCID.status.short')
      .then((r) => {
        assert.equal(r.light, colors[i]);
        done();
      })
      .catch((err) => done(err));

    const msg = {
      light: colors[i],
      crosswalk_id: 'fakeCID',
    };
    produceMessage(con, 'private', 'fakeCID.light.update', msg);
  });
});
