// backend/routes/auth.js
const express  = require('express'); // For creating routes
const bcrypt   = require('bcrypt'); // For hashing passwords
const jwt      = require('jsonwebtoken'); // For creating JWT tokens
const User     = require('../models/User'); 

const router = express.Router();

//REGISTER
// This route is used to register a new user
// It takes in the email and password from the request body
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt); // Hash the password
    const user = new User({ email, password: hash });
    // Create a new user with the hashed password
    await user.save();
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Create a token for the user with a 1 day expiration and returns it with user data
    );
    res.status(201).json({ user: { _id: user._id, email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN

// This route is used to login a user
router.post('/login', async (req, res) => {
  const { email, password } = req.body; // Get the email and password from the request body and if the user exists 
  // and information is correct, create a token for the user
  try {
    const user = await User.findOne({ email });
    //Checking if the user exists and inputs are coreerct
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.status(200).json({ user: { _id: user._id, email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' }); //eroro if something goes wrong
  }
});

module.exports = router;
