const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config(); // Load environment variables from .env

// MySQL connection pool using environment variables
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT, // Optional: Include if your database uses a non-default port
});

async function authenticate(req, res, next) {
  try {
    // Extract JWT from cookies
    const jwtToken = req.cookies.jwt;

    if (!jwtToken) {
      console.log('No JWT token found, returning 401 Unauthorized');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: You must be signed in to access this resource.',
      });
    }

    try {
      const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

      // Query the MySQL database for the user
      const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.userID]);

      if (rows.length === 0) {
        console.log('No user found for decoded JWT');
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User not found.',
        });
      }

      console.log('Authenticated via JWT');
      req.user = rows[0]; // Attach the user data to req.user
      res.locals.user = rows[0];
      return next();
    } catch (jwtError) {
      console.error('JWT Verification Error:', jwtError.message);
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token.',
      });
    }
  } catch (error) {
    console.error('Error in authenticate middleware:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
}

module.exports = authenticate;