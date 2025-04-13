const jwt = require('jsonwebtoken');

function jwtParser(req, res, next) {
  const token = req.cookies.jwt; // Read the JWT from cookies
  if (!token) {
    req.user = null; // No token, set user as null
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify JWT
    req.user = decoded; // Attach decoded user data to req.user
    console.log('User in request:', req.user);
    next();
  } catch (err) {
    console.error('Error verifying JWT:', err.message);
    req.user = null; // Invalid token, set user as null
    next();
  }
}

module.exports = jwtParser;
