const express = require('express');
const Vehicle = require('./models/Vehicle');
const Pedestrian = require('./models/Pedestrian');
const { v4 : uuidv4 } = require('uuid');
const router = express.Router();

router.post('/welcome/pedestrian', (_req, res) => {
  const pedestrian = new Pedestrian({ uid: uuidv4() });
  pedestrian.save((err) => {
    if (err) {
      console.log(err);
    }
  });
  res.status(201);
  res.json({ 'id': pedestrian.uid });
});

router.post('/welcome/vehicle', (_req, res) => {
  const vehicle = new Vehicle({ uid: uuidv4() });
  vehicle.save((err) => {
    if (err) {
      console.log(err);
    }
    else {
      res.status(201);
      res.json({ 'id': vehicle.uid });
    }
  });
});

router.get('/welcome/pedestrian/:id', (req, res) => {
  Pedestrian.findOne({ uid: req.params.id })
    .then(p => {
      if (p) {
        res.status(200);
        res.json({ 
          'id': p.uid,
          'creation_date': p.createdAt
        });
      }
      else {
        res.sendStatus(404);
      }
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(404);
    });
});

router.get('/welcome/vehicle/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ uid: req.params.id });
    res.json({ 
      'id': vehicle.uid,
      'creation_date': vehicle.createdAt
    });
  } catch (err) {
    res.status(404);
    res.json({
      'msg': "There isn't a Vehicle with that id"
    });
  }
});

module.exports = router;