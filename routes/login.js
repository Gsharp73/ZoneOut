const express = require('express');
const router = express.Router();
const User = require('../models/User');
const axios = require('axios');

// Global variable to store the random image URL
let globalImageUrl = '';

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
    // Check if the global image URL is empty
    if (!globalImageUrl) {
      globalImageUrl = await getRandomImage();
    }
    res.render('login', { imageUrl: globalImageUrl, error: null });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

router.get('/new', async (req, res) => {
  try {
    // Check if the global image URL is empty
    if (!globalImageUrl) {
      globalImageUrl = await getRandomImage();
    }
    res.render('newuser', { imageUrl: globalImageUrl, error: null });
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
      console.log("Logged in");
      res.json({ success: true, redirect: '/home' });
    } else {
      console.log("Invalid credentials");
      if (!globalImageUrl) {
        globalImageUrl = await getRandomImage();
      }
      res.json({ success: false, error: 'Invalid username or password', imageUrl: globalImageUrl });
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
      if (!globalImageUrl) {
        globalImageUrl = await getRandomImage();
      }
      res.json({ success: false, error: 'Username already exists', imageUrl: globalImageUrl });
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
