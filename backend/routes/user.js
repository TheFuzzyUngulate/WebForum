const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');

// Create a new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Username must be provided' });
  } else if (!password) {
    return res.status(400).json({ message: 'Password must be provided' });
  }

  const altUser = await User.findOne({ name: username });
  if (altUser) {
    return res.status(401).json({ message: 'User already exists' });
  }
  const user = new User({ name: username, email: email, password: password });
  await user.save();
  
  req.session.userId = user._id;
  req.session.userName = user.name;
  req.session.isLoggedIn = true;
  req.session.save();
  
  res.json(user);
});

// Get information on random user
router.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not available" });
    }
    res.json({ 
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.err(err.message);
    res.status(500).json({message: 'Server error'});
  }
});

// Get information on user
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.json({ name: user.name, email: user.email, id: req.session.userId });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({message: 'Server error'});
  }
});

module.exports = router;