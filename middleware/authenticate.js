const jwt = require('jsonwebtoken');

async function authenticate(req, res, next) {
  try {

    // Extract JWT from cookies
    const jwtToken = req.cookies.jwt;

    if (jwtToken) {
      try {
        const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
        const user = await req.db.collection('Subscribers').findOne({ userID: decoded.userID });

        if (user) {
          console.log('Authenticated via JWT');
          req.user = user;
          res.locals.user = user;
          return next();
        } else {
          console.log('No user found for decoded JWT');
        }
      } catch (jwtError) {
        console.error('JWT Verification Error:', jwtError.message);
      }
    }

    console.log('No valid authentication, returning 401 Unauthorized');
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: You must be signed in to access this resource.',
    });
  } catch (error) {
    console.error('Error in authenticate middleware:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
}

module.exports = authenticate;