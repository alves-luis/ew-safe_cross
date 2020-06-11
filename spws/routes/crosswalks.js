const express = require('express');
const axios = require('axios').default;
const router = express.Router();

const crosswalks_location = process.env.CROSSWALKS_LOCATION_SERVICE_HOSTNAME;
const crosswalks_status = process.env.CROSSWALKS_CURRENT_STATUS_SERVICE_HOSTNAME;
const crosswalks_logger = process.env.CROSSWALKS_LOGGER_SERVICE_HOSTNAME;

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

async function getLastDayInfo(res,id){
  url = `http://${crosswalks_logger}/v1/crosswalks/${id}`;
  return axios.get(url).then((response) => {return response.data});
}


router.get('/:id', (req, res) => {
  const id = req.params.id;
  let url = `http://${crosswalks_status}/v1/${id}/light`;
  axios.get(url).then((response) => {
    if (response.status != 200) {
      res.sendStatus(response.status);
    }
    else {
      getLastDayInfo(res,id).then((responseI) => {
      responseF = Object.assign({}, response.data,responseI);
      res.status(200);
      res.json(responseF);
    });
    }
  })
  .catch((err) => {
    console.error(err);
    res.sendStatus(err.response.status);
  })
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
