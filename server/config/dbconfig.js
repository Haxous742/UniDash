const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL);

const db = mongoose.connection;

db.on('connected', () => {
    console.log('Database connected successfully');
});

db.on('error', () => {
    console.error('Database connection error');
});

module.exports = db;