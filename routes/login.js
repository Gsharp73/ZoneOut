const express = require('express');
const router = express.Router();
const User = require('../models/User');
const axios = require('axios');

async function getRandomImage() {
  const response = await axios.get(`https://api.unsplash.com/photos/random?client_id=${process.env.UNSPLASH_ACCESS_KEY}`);
  return response.data.urls.full;
}

router.get('/', async (req, res) => {
  const imageUrl = await getRandomImage();
  res.render('login', { imageUrl, error: null });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user && user.password === password) {
    req.session.username = username;
    res.redirect('/home');
  } else {
    const imageUrl = await getRandomImage();
    res.render('login', { imageUrl, error: 'Invalid username or password' });
  }
});

router.get('/new', async (req, res) => {
  const imageUrl = await getRandomImage();
  res.render('newuser', { imageUrl, error: null });
});

router.post('/new', async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username });
    console.log(username, password);
  if (existingUser) {
    const imageUrl = await getRandomImage();
    res.render('login', { imageUrl, error: 'Username already exists' });
  } 
  else {
    const newUser = new User({ username, password });
    await newUser.save();
    req.session.username = username;
    res.redirect('/home');
  }
});

module.exports = router;
