const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const router = express.Router();
const auth = require('../middleware/auth');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  } else if (!password) {
    return res.status(400).json({ message: 'Username is required' });
  } else if (req.session.isLoggedIn) {
    return res.status(200).json({ message: 'User is already logged in' });
  }

  const user = await User.findOne({ name: username });
  if (!user) {
    return res.status(401).json({ message: 'Username or password is incorrect' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: 'Username or password is incorrect' });
  }

  req.session.userId = user._id;
  req.session.userName = user.name;
  req.session.isLoggedIn = true;
  req.session.save();

  res.status(200).json({ message: 'Successfully authenticated' });
});

router.delete('/logout', auth, async (req, res) => {
  req.session.destroy(err => {
    if (err) {
      res.status(400).json({ message: 'Unable to logout' });
    } else {
      res.clearCookie('connect.sid', { path: '/' });
      res.status(200).json({ message: 'Logout successful' });
    }
  });
});

module.exports = router;