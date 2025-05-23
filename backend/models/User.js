// backend/models/User.js
const mongoose = require('mongoose');

//Holds information for each user, takes in email and password
// and creates a new user in the database
const userSchema = new mongoose.Schema({
  email: {
    type:      String,
    required:  true,
    unique:    true,
    lowercase: true,
  },
  password: {
    type:     String,
    required: true,
  },
}, { timestamps: true });
// Every time a user is created, the time of creation is stored

module.exports = mongoose.model('User', userSchema);