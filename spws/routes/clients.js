const express = require('express');
const axios = require('axios').default;
const router = express.Router();

const welcome_service = process.env.WELCOME_SERVICE_HOSTNAME;

router.post('/signup/pedestrian', (req, res) => {
  axios.post(`http://${welcome_service}/v1/welcome/pedestrian/`)
    .then((response) => {
      if (response.status != 201) {
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

router.post('/signup/vehicle', (req, res) => {
  axios.post(`http://${welcome_service}/v1/welcome/vehicle/`)
    .then((response) => {
      if (response.status != 201) {
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