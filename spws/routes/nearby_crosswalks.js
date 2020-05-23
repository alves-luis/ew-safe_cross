const express = require('express');
const axios = require('axios').default;
const router = express.Router();

const nearby_crosswalks = process.env.NEARBY_CROSSWALKS_SERVICE_HOSTNAME;

router.post('/:id/location', (req, res) => {
  const lon = req.body.lon;
  const lat = req.body.lat;

  axios.get(`http://${nearby_crosswalks}/v1/crosswalks/`, {
    params: {
      lon: lon,
      lat: lat
    }
  })
    .then((response) => {
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

module.exports = router;