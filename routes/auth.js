const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// MySQL connection pool
const db = mysql.createPool({
  host: '192.168.1.232',
  user: 'euphoriaapi',
  password: 'nTBeE38AhIprEXgp',
  database: 'euphoriaapi',
});

// Nodemailer transporter for sending emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // Your SMTP host
  port: process.env.SMTP_PORT, // Your SMTP port (e.g., 587 for TLS, 465 for SSL)
  secure: process.env.SMTP_SECURE === 'true', // Use true for SSL, false for TLS
  auth: {
    user: process.env.SMTP_USER, // Your SMTP username
    pass: process.env.SMTP_PASSWORD, // Your SMTP password
  },
});

// Register endpoint
router.post('/register', async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Check if the email or username already exists
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit code
    await db.query(
      'INSERT INTO users (email, username, password, is_verified, verification_code, admin) VALUES (?, ?, ?, ?, ?, ?)',
      [email, username, hashedPassword, 0, verificationCode, 0]
    );

    // Send the verification email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Account',
      text: `Your verification code is: ${verificationCode}`,
    });

    res.status(201).json({ message: 'User registered successfully. Please verify your email.' });
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Email verification endpoint
router.post('/verify-email', async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    // Check if the verification code matches
    const [user] = await db.query(
      'SELECT * FROM users WHERE email = ? AND verification_code = ?',
      [email, verificationCode]
    );

    if (user.length === 0) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Mark the user as verified
    await db.query('UPDATE users SET is_verified = 1, verification_code = NULL WHERE email = ?', [
      email,
    ]);

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Error during email verification:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    // Check if the user exists and is verified
    const [user] = await db.query(
      'SELECT * FROM users WHERE (email = ? OR username = ?) AND is_verified = 1',
      [emailOrUsername, emailOrUsername]
    );

    if (user.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials or account not verified' });
    }

    // Check if the password matches
    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT for the user
    const token = jwt.sign(
      { userID: user[0].id, username: user[0].username, admin: user[0].admin },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Set the JWT in a cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    });

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Login with Discord
router.post('/login/discord', async (req, res) => {
  const { discordId } = req.body;

  try {
    // Check if the user exists with the linked Discord ID
    const [user] = await db.query('SELECT * FROM users WHERE discord_id = ?', [discordId]);

    if (user.length === 0) {
      return res.status(400).json({ message: 'No account linked with this Discord ID' });
    }

    // Generate a JWT for the user
    const token = jwt.sign(
      { userID: user[0].id, username: user[0].username, admin: user[0].admin },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Set the JWT in a cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    });

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during Discord login:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;