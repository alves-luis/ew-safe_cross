const express = require('express');
const axios = require('axios').default;
const router = express.Router();

const crosswalks_location = process.env.CROSSWALKS_LOCATION_SERVICE_HOSTNAME;

router.get('/', (req, res) => {
  const lon = req.query.lon;
  const lat = req.query.lat;
  const range = req.query.range;

  let url;
  if (lon && lat && range) {
    url = `http://${crosswalks_location}/v1/crosswalks?range=${range}&lon=${lon}&lat=${lat}`;
  }
  else {
    url = `http://${crosswalks_location}/v1/crosswalks/`;
  }

  axios.get(url).then((response) => {
    if (response.status != 200) {
      res.sendStatus(response.status);
    }
    else {
      res.status(200);
      res.json(response.data);
    }
  })
  .catch((err) => {
    console.log(err);
    res.sendStatus(500);
  });
});

router.get('/:id', (req, res) => {
  // TODO
});

router.post('/', (req, res) => {
  const lon = req.body.lon;
  const lat = req.body.lat;
  const payload = {
    lon: lon,
    lat: lat
  };
  const url = `http://${crosswalks_location}/v1/crosswalks/`;

  axios.post(url, payload).then((response) => {
    if (response.status != 201) {
      res.sendStatus(response.status);
    }
    else {
      res.status(201);
      res.json(response.data);
    }
  })
  .catch((err) => {
    if (err.response.status != 409) {
      console.log(err);
      res.sendStatus(500);
    }
    else {
      res.sendStatus(err.response.status);
    }
  });
});

module.exports = router;