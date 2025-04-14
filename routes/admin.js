const express = require('express');
const router = express.Router();
const compression = require('compression'); // For response compression
const authenticate = require('../middleware/authenticate');
const isAdmin = require('../middleware/isAdmin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Middleware for response compression
router.use(compression());

// Route to view telemetry information
router.get('/telemetry', authenticate, isAdmin, async (req, res) => {
  try {
    const [telemetryData] = await req.db.query('SELECT * FROM telemetry');
    res.json({ telemetry: telemetryData });
  } catch (error) {
    console.error('Error fetching telemetry data:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to view debug logs
router.get('/logs', authenticate, isAdmin, (req, res) => {
  const logFilePath = path.join(__dirname, '..', 'logs', 'debug.log');

  fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading log file:', err.message);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.type('text/plain').send(data);
  });
});

// Route to view all users
router.get('/users', authenticate, isAdmin, async (req, res) => {
  try {
    const [users] = await req.db.query('SELECT id, email, username, admin, is_verified FROM users');
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to view banned users
router.get('/users/banned', authenticate, isAdmin, async (req, res) => {
  try {
    const [bannedUsers] = await req.db.query('SELECT id, email, username FROM users WHERE is_verified = 0');
    res.json({ bannedUsers });
  } catch (error) {
    console.error('Error fetching banned users:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to assign admin role to a user
router.put('/users/:id/admin', authenticate, isAdmin, async (req, res) => {
  const userId = req.params.id;

  try {
    const [result] = await req.db.query('UPDATE users SET admin = 1 WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User has been assigned as an admin' });
  } catch (error) {
    console.error('Error assigning admin role:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to remove admin role from a user
router.put('/users/:id/remove-admin', authenticate, isAdmin, async (req, res) => {
  const userId = req.params.id;

  try {
    const [result] = await req.db.query('UPDATE users SET admin = 0 WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Admin privileges have been removed from the user' });
  } catch (error) {
    console.error('Error removing admin role:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to ban a user
router.put('/users/:id/ban', authenticate, isAdmin, async (req, res) => {
  const userId = req.params.id;

  try {
    const [result] = await req.db.query('UPDATE users SET is_verified = 0 WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User has been banned from the site' });
  } catch (error) {
    console.error('Error banning user:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to unban a user
router.put('/users/:id/unban', authenticate, isAdmin, async (req, res) => {
  const userId = req.params.id;

  try {
    const [result] = await req.db.query('UPDATE users SET is_verified = 1 WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User has been unbanned and can now access the site' });
  } catch (error) {
    console.error('Error unbanning user:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;