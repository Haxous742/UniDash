const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: String,
  
  // OAuth tokens for different services
  googleTokens: {
    accessToken: String,
    refreshToken: String,
    expiryDate: Date
  },
  
  spotifyTokens: {
    accessToken: String,
    refreshToken: String,
    expiryDate: Date
  },
  
  microsoftTokens: {
    accessToken: String,
    refreshToken: String,
    expiryDate: Date
  },
  
  // User preferences
  preferences: {
    theme: { type: String, default: 'light' },
    dashboardLayout: [String],
    notifications: {
      email: { type: Boolean, default: true },
      calendar: { type: Boolean, default: true },
      music: { type: Boolean, default: true }
    }
  },
  
  // Connected services
  connectedServices: [{
    service: String, // 'google', 'spotify', 'microsoft'
    connected: Boolean,
    lastSync: Date
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
