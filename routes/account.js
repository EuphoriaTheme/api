const axios = require('axios');
const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2/promise');
const router = express.Router();
require('dotenv').config(); // Load environment variables from .env

// MySQL connection pool using environment variables
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT, // Optional: Include if your database uses a non-default port
});
 
// Multer configuration for avatar uploads
const storage = multer.diskStorage({
  destination: '../uploads/avatars',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Link Discord account
// Link Discord account using OAuth
router.get('/link/discord', async (req, res) => {
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const scope = encodeURIComponent('identify email');
  const state = 'random-state-string'; // Generate and store this for CSRF protection
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&state=${state}`;
  
  res.redirect(discordAuthUrl);
});

router.get('/link/discord/callback', async (req, res) => {
  const { code } = req.query;
  const userId = req.user.id; // Ensure the user is authenticated

  try {
    if (!code) {
      throw new Error('No authorization code provided');
    }

    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Fetch the user's Discord profile
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const discordUser = userResponse.data;

    // Link the Discord account to the user in the database
    const [result] = await db.query(
      'UPDATE users SET discord_id = ? WHERE id = ?',
      [discordUser.id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Discord account linked successfully' });
  } catch (error) {
    console.error('Error during Discord linking:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete account
router.delete('/delete', async (req, res) => {
  const { userId } = req.body;
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload avatar
router.post('/avatar/upload', upload.single('avatar'), async (req, res) => {
  const { userId } = req.body;
  const avatarPath = req.file.path;
  try {
    const [result] = await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarPath, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Avatar uploaded successfully', avatarPath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete avatar
router.delete('/avatar/delete', async (req, res) => {
  const { userId } = req.body;
  try {
    const [result] = await db.query('UPDATE users SET avatar = NULL WHERE id = ?', [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Avatar deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update email
router.put('/update/email', async (req, res) => {
  const { userId, newEmail } = req.body;
  try {
    const [result] = await db.query('UPDATE users SET email = ? WHERE id = ?', [newEmail, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Email updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update password
router.put('/update/password', async (req, res) => {
  const { userId, newPassword } = req.body;
  try {
    const [result] = await db.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;