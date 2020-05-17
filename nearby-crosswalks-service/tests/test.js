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
      .then(function(res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.id, id);
        assert.exists(res.body.creation_date);
        done();
      })
      .catch(function(err) {
        throw err;
      });
  }).timeout(5000);
  it("GET /welcome/pedestrian/id (doesn't exist)", function(done) {
    chai
      .request(app)
      .get('/v1/welcome/pedestrian/333')
      .send()
      .then(function(res) {
        assert.equal(res.status, 404);
        assert.exists(res.body.msg);
        done();
      })
      .catch(function(err) {
        throw err;
      });
  }).timeout(5000);
});