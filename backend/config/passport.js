const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const SpotifyStrategy = require('passport-spotify').Strategy;
const User = require('./models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
  scope: [
    'profile', 
    'email', 
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/drive.readonly'
  ]
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Update existing user's Google tokens
      user.googleTokens = {
        accessToken,
        refreshToken,
        expiryDate: new Date(Date.now() + 3600000) // 1 hour
      };
      await user.save();
    } else {
      // Create new user
      user = new User({
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0].value,
        googleTokens: {
          accessToken,
          refreshToken,
          expiryDate: new Date(Date.now() + 3600000)
        },
        connectedServices: [{
          service: 'google',
          connected: true,
          lastSync: new Date()
        }]
      });
      await user.save();
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.use(new SpotifyStrategy({
  clientID: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  callbackURL: "/auth/spotify/callback",
  scope: [
    'user-read-private',
    'user-read-email',
    'user-read-playback-state',
    'user-modify-playback-state',
    'playlist-modify-public',
    'playlist-modify-private'
  ]
}, async (accessToken, refreshToken, expires_in, profile, done) => {
  try {
    const user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      user.spotifyTokens = {
        accessToken,
        refreshToken,
        expiryDate: new Date(Date.now() + expires_in * 1000)
      };
      
      // Add or update Spotify service
      const spotifyService = user.connectedServices.find(s => s.service === 'spotify');
      if (spotifyService) {
        spotifyService.connected = true;
        spotifyService.lastSync = new Date();
      } else {
        user.connectedServices.push({
          service: 'spotify',
          connected: true,
          lastSync: new Date()
        });
      }
      
      await user.save();
      return done(null, user);
    } else {
      return done(new Error('User not found. Please connect Google first.'), null);
    }
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
