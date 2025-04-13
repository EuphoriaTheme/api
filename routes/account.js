const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2/promise');
const router = express.Router();

// MySQL connection pool
const db = mysql.createPool({
  host: '192.168.1.232',
  user: 'euphoriaapi',
  password: 'nTBeE38AhIprEXgp',
  database: 'euphoriaapi',
});
 
// Multer configuration for avatar uploads
const storage = multer.diskStorage({
  destination: './uploads/avatars',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Link Discord account
router.post('/link/discord', async (req, res) => {
  const { userId, discordId } = req.body;
  try {
    const [result] = await db.query('UPDATE users SET discord_id = ? WHERE id = ?', [discordId, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Discord account linked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
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