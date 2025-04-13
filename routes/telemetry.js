const express = require('express');
const geoip = require('geoip-lite');
const router = express.Router();
const compression = require('compression'); // For response compression
const saveToLogFile = require('../utils/saveToLogFile');
require('dotenv').config();

// Middleware for response compression
router.use(compression());

// Debug endpoint
router.post('/debug', (req, res) => {
    let debugInfo = {
        productId: req.body.product.id,
        productName: req.body.product.name,
        productVersion: req.body.product.version,
        requestOrigin: req.body.origin,
        requestMethod: req.body.method,
        requestUrl: req.body.source,
    };

    saveToLogFile('debug', debugInfo);

    res.json({
        success: true,
        message: 'Successfully received debug info',
        debugInfo,
    });
});

//Function to get client IP address
function getClientIp(req) {
    return req.headers['x-forwarded-for']?.split(',').shift() || req.socket.remoteAddress;
}
 
// Telemetry endpoint
router.post('/telemetry', (req, res) => {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const timestamp = new Date().toISOString();
    const platform = req.query.platform || req.body?.platform || 'unknown';
    const ip = getClientIp(req);
  
    const geo = geoip.lookup(ip);
  
    const telemetryData = {
      userAgent,
      timestamp,
      platform,
      ip,
      geo: geo || { error: 'Geo info not found' },
    };

    saveToLogFile('telemetry', telemetryData);
  
    res.json({
      success: true,
      version: ApiVersion,
      telemetry: telemetryData,
    });
});

module.exports = router;