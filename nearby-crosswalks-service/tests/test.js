const chaiHttp = require('chai-http');
const chai = require('chai');
const app = require('../server');
const fs = require('fs');

chai.use(chaiHttp);
const assert = chai.assert;

describe('Adding a single crosswalk and retrieving it', function() {
  const lon = -69.34;
  const lat = 27;
  it('POST /crosswalks/', function(done) {
    chai
      .request(app)
      .post('/v1/crosswalks/')
      .send({'lon': lon, 'lat': lat})
      .end(function(_err, res) {
        assert.equal(res.status, 201);
        assert.exists(res.body.uid);
        assert.equal(res.body.lon, lon);
        assert.equal(res.body.lat, lat);
        done();
      });
  }).timeout(5000);
  it('GET nearby /crosswalks/?lon=:lon&lat=:lat', function(done) {
    chai
      .request(app)
      .get(`/v1/crosswalks/?lon=${lon}&lat=${lat}`)
      .send()
      .then(function(res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.crosswalks.length, 1);
        assert.equal(res.body.crosswalks[0].lon, lon);
        assert.equal(res.body.crosswalks[0].lat, lat);
        done();
      })
      .catch(function(err) {
        throw err;
      });
  }).timeout(5000);
});

describe('Adding an invalid single crosswalk and trying retrieving it', function() {
  let lon = -197.46;
  let lat = 25;
  it('POST /crosswalks/ with invalid longitude', function(done) {
    chai
      .request(app)
      .post('/v1/crosswalks/')
      .send({'lon': lon, 'lat': lat})
      .end(function(_err, res) {
        assert.equal(res.status, 409);
        done();
      });
  }).timeout(5000);
  it(`GET nearby invalid longitude /crosswalks/?lon=${lon}&lat=${lat}`, function(done) {
    chai
      .request(app)
      .get(`/v1/crosswalks/?lon=${lon}&lat=${lat}`)
      .send()
      .then(function(res) {
        assert.equal(res.status, 400);
        done();
      })
      .catch(function(err) {
        throw err;
      });
  }).timeout(5000);
  lon = -20.55;
  lat = 92;
  it('POST /crosswalks/ with invalid latitude', function(done) {
    chai
      .request(app)
      .post('/v1/crosswalks/')
      .send({'lon': lon, 'lat': lat})
      .end(function(_err, res) {
        assert.equal(res.status, 409);
        done();
      });
  }).timeout(5000);
  it(`GET nearby invalid longitude /crosswalks/?lon=${lon}&lat=${lat}`, function(done) {
    chai
      .request(app)
      .get(`/v1/crosswalks/?lon=${lon}&lat=${lat}`)
      .send()
      .then(function(res) {
        assert.equal(res.status, 400);
        done();
      })
      .catch(function(err) {
        throw err;
      });
  }).timeout(5000);
});
