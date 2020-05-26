const express = require('express');
const router = express.Router();

// Routes associated with crosswalks
router.use('/v1/crosswalks', require('./crosswalks'));

// Routes associated with clients
router.use('/v1/pedestrian', require('./clients'));
router.use('/v1/vehicle', require('./clients'));

module.exports = router;