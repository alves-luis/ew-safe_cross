const express = require('express');
const axios = require('axios').default;
const router = express.Router();

const crosswalks_service = process.env.CROSSWALKS_SERVICE_HOSTNAME;

router.post('/pedestrian/:id/near/:crosswalk_id', (req, res) => {
  // TODO
});

module.exports = router;