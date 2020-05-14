const express = require('express');
const Vehicle = require('./models/Vehicle');
const Pedestrian = require('./models/Pedestrian');
const { v4 : uuidv4 } = require('uuid');
const router = express.Router();

router.post('/welcome/pedestrian', (_req, res) => {
  const pedestrian = new Pedestrian({ uid: uuidv4()});
  pedestrian.save((err) => {
    if (err) {
      console.log(err);
    }
  });
  res.status(201);
  res.send({ 'id': pedestrian.uid });
});

router.post('/welcome/vehicle', (_req, res) => {
  const vehicle = new Vehicle({ uid: uuidv4()});
  vehicle.save((err) => {
    if (err) {
      console.log(err);
    }
  });
  res.status(201);
  res.send({ 'id': vehicle.uid });
});

router.get('/welcome/pedestrian/:id', async (req, res) => {
  const pedestrian = await Pedestrian.findOne({ uid: req.params.id });
  res.send(pedestrian);
});

module.exports = router;