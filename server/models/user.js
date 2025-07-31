const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: false,
    },
    lastname: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: false,
        select: false, 
        minlength: 6 
    },
    profilePic: {
        type: String,
        required: false,
    }

}, {timestamps: true});

module.exports = mongoose.model('Users', userSchema);  