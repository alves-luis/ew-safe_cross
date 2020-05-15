const chaiHttp = require('chai-http');
const chai = require('chai');
const app = require('../server');

chai.use(chaiHttp);
const assert = chai.assert;

describe('Pedestrian Routes', function() {
  let id;
  it('POST /welcome/pedestrian', function(done) {
    chai
      .request(app)
      .post('/v1/welcome/pedestrian')
      .send()
      .end(function(_err, res) {
        assert.equal(res.status, 201);
        assert.exists(res.body.id);
        id = res.body.id;
        done();
      });
  }).timeout(5000);
  it('GET /welcome/pedestrian/id', function(done) {
    chai
      .request(app)
      .get(`/v1/welcome/pedestrian/${id}`)
      .send()
      .then(function(res, _err) {
        assert.equal(res.status, 200);
        assert.equal(res.body.id, id);
        assert.exists(res.body.creation_date);
        done();
      });
  }).timeout(5000);
});

describe('Vehicle Routes', function() {
  let id;
  it('POST /welcome/vehicle', function(done) {
    chai
      .request(app)
      .post('/v1/welcome/vehicle')
      .send()
      .end(function(_err, res) {
        assert.equal(res.status, 201);
        assert.exists(res.body.id);
        id = res.body.id;
        done();
      });
  }).timeout(5000);
  it('GET /welcome/vehicle/id', function(done) {
    chai
      .request(app)
      .get(`/v1/welcome/vehicle/${id}`)
      .send()
      .then(function(res, _err) {
        assert.equal(res.status, 200);
        assert.equal(res.body.id, id);
        assert.exists(res.body.creation_date);
        done();
      });
  }).timeout(5000);
});