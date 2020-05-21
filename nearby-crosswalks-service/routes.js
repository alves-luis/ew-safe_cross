const express = require('express');
const Crosswalk = require('./models/Crosswalk');
const router = express.Router();

router.get('/crosswalks/', (req, res) => {
  const lon = req.query.lon;
  const lat = req.query.lat;
  Crosswalk.find({
    location: {
      $near: {
        $maxDistance: parseInt(process.env.MAX_DISTANCE),
        $geometry: {
          type: 'Point',
          coordinates: [lon, lat]
        }
      }
    }
  }).find((error, results) => {
    if (error) {
      res.sendStatus(400);
    }
    else {
      let crosswalks = []
      results.forEach((r) => {
        let crosswalk = {
          'lon': r.location.coordinates[0],
          'lat': r.location.coordinates[1],
          'creation_date': r.createdAt
        };
        crosswalks.push(crosswalk);
      });
      res.status(200);
      res.json({ 'crosswalks': crosswalks });
    }
  });
});

router.post('/crosswalks/', (req, res) => {
  const lon = req.body.lon;
  const lat = req.body.lat;
  const crosswalk = new Crosswalk({
    location: {
      coordinates: [lon, lat],
    }
  });
  crosswalk.save((err) => {
    if (err) {
      res.sendStatus(409);
    }
    else {
      res.status(201);
      res.json({
        'uid': crosswalk.uid,
        'lon': crosswalk.location.coordinates[0],
        'lat': crosswalk.location.coordinates[1]
      });
    }
  });
});

module.exports = router;
