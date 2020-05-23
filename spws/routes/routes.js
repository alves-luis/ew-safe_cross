const express = require('express');
const router = express.Router();

// Routes associated with welcome-service
router.use('/v1', require('./welcome'));

// Routes associated with nearby-crosswalks-service
router.use('/v1/pedestrian', require('./nearby_crosswalks'));
router.use('/v1/vehicle', require('./nearby_crosswalks'));

// Routes associated with crosswalks service
router.use('/v1', require('./crosswalks'));

module.exports = router;