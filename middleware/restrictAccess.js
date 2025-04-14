const dotenv = require('dotenv');

// Middleware to restrict access based on IP or domain
function restrictAccess(req, res, next) {
    const allowedDomains = process.env.ALLOWED_DOMAINS.split(',');
    const requestIP = req.ip; // Get the request's IP address
    const requestDomain = req.hostname; // Get the request's hostname
  
    if (allowedIPs.includes(requestIP) || allowedDomains.includes(requestDomain)) {
      return next(); // Allow access
    }
  
    console.log(`Access denied for IP: ${requestIP}, Domain: ${requestDomain}`);
    return res.status(403).json({ message: 'Access denied: Unauthorized IP or domain' });
  }

  module.exports = restrictAccess;