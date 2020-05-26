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

module.exports = router;