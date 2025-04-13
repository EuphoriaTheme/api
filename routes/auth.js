const axios = require('axios');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Add this line

router.get('/discord', (req, res) => {
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const scope = encodeURIComponent('identify email');
  const state = 'random-state-string'; // Generate and store this for CSRF protection
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&state=${state}`;
  
  res.redirect(discordAuthUrl);
});

router.get('/discord/callback', async (req, res) => {
  const { code } = req.query;

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

    // Save or update the user in MongoDB
    const user = await req.db.collection('Subscribers').findOneAndUpdate(
      { userID: discordUser.id },
      {
        $set: {
          username: discordUser.username,
          avatar: discordUser.avatar,
          discriminator: discordUser.discriminator,
          email: discordUser.email || null,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Generate a JWT for the user
    const token = jwt.sign(
      { userID: discordUser.id, username: discordUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Set the JWT in a cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    });

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error during Discord callback:', error.stack || error.message);

    // Handle specific errors with descriptive messages
    if (error.response) {
      console.error('Response data:', error.response.data);
      res.status(500).send('An error occurred during authentication.');
    } else {
      res.status(500).send('An unexpected error occurred.');
    }
  }
});

  
  router.get('/logout', (req, res) => {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    });
    res.redirect('/');
  });
  
  module.exports = router;