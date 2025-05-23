// backend/middleware/auth.js

//This is for security, to check if the user is logged in
// and to verify the token
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const header = req.header('Authorization'); // Get the token from the header (should be of the form “Bearer <token>”)
  if (!header) return res.status(401).json({ message: 'No token, auth denied' }); //check if the token is present

  const token = header.split(' ')[1]; // “Bearer <token>”
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(userId).select('-password'); //Find the user by only by id
    if (!user) throw Error();
    req.user = user; // Attach the user to the request object so route handlers know who is making the request
    next();
  } catch {
    res.status(401).json({ message: 'Token is not valid' });
  }
}; //if any error occurs, send a 401 status code with a message
// This middleware will be used in the routes to protect them and ensure that only authenticated users can access them
