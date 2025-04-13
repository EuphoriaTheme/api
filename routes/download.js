const express = require('express');
const router = express.Router();
const path = require('path');
const compression = require('compression'); // For response compression
const authenticate = require('../middleware/authenticate');
require('dotenv').config();

// Middleware for response compression
router.use(compression());

router.get('/download/game-api', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, '../private/downloads/game-api.zip'));
});

module.exports = router;