const express = require('express');
const Crosswalk = require('./models/Crosswalk');
const router = express.Router();
const publishNewCrosswalk = require('./rabbit');

// Get all crosswalks within defined range
router.get('/crosswalks/', (req, res) => {
  const lon = req.query.lon;
  const lat = req.query.lat;
  const range = req.query.range;

  let conditions;

  if (lon && lat) {
    conditions = {
      location: {
        $near: {
          $maxDistance: parseInt(range ? range : process.env.MAX_DISTANCE),
          $geometry: {
            type: 'Point',
            coordinates: [lon, lat]
          }
        }
      }
    };
  }
  else {
    conditions = {};
  }

  Crosswalk.find(conditions)
    .then(r => {
      let crosswalks = [];
      r.forEach((c) => {
        let crosswalk = {
          'id': c.uid,
          'lon': c.location.coordinates[0],
          'lat': c.location.coordinates[1],
          'creation_date': c.createdAt
        };
        crosswalks.push(crosswalk);
      });
      res.status(200);
      res.json({ 'crosswalks': crosswalks});
    })
    .catch(err => {
      console.log('Error:', err.message);
      res.sendStatus(400);
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
      publishNewCrosswalk(crosswalk.uid);
    }
  });
});

module.exports = router;
