const express = require('express');
const router = express.Router();
const User = require('../models/User');
const axios = require('axios');

async function getRandomImage() {
  try {
    const response = await axios.get(`https://api.unsplash.com/photos/random?client_id=${process.env.UNSPLASH_ACCESS_KEY}`);
    return response.data.urls.full;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}

router.get('/', async (req, res) => {
  try {
    const imageUrl = await getRandomImage();
    res.render('login', { imageUrl, error: null });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
      
    const user = await User.findOne({ username });

    if (user && user.password === password) {
      req.session.username = username;
      console.log("Loggedin");
      res.json({ success: true, redirect: '/home' });
    } else {
      console.log("false");
      const imageUrl = await getRandomImage();
      res.json({ success: false, error: 'Invalid username or password', imageUrl });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

router.post('/new', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      const imageUrl = await getRandomImage();
      res.json({ success: false, error: 'Username already exists', imageUrl });
    } else {
      const newUser = new User({ username, password });
      await newUser.save();
      req.session.username = username;
      res.json({ success: true, redirect: '/home' });
    }
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
