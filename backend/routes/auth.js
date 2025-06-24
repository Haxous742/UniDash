const express = require('express');
const passport = require('passport');
require('../config/passport');

const router = express.Router();

// Google OAuth
router.get('/google', passport.authenticate('google'));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    res.redirect('http://localhost:5173/dashboard');
  }
);

// Spotify OAuth
router.get('/spotify', passport.authenticate('spotify'));

router.get('/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: 'http://localhost:5173/dashboard' }),
  (req, res) => {
    res.redirect('http://localhost:5173/dashboard?connected=spotify');
  }
);

// Get current user
router.get('/user', (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar,
        connectedServices: req.user.connectedServices,
        preferences: req.user.preferences
      }
    });
  } else {
    res.json({ success: false, message: 'Not authenticated' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ success: true, message: 'Logged out successfully' });
  });
});
