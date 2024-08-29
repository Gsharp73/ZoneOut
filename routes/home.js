const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');

async function getRandomImage() {
  try {
    const response = await axios.get('https://api.unsplash.com/photos/random', {
      params: {
        client_id: process.env.UNSPLASH_ACCESS_KEY,
        query: 'nature, relaxation, peaceful',
        count: 1
      }
    });

    if (response.data && response.data[0] && response.data[0].urls && response.data[0].urls.full) {
      return response.data[0].urls.full;
    } else {
      throw new Error('Unexpected response format');
    }
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    throw error;
  }
}

router.get('/', async (req, res) => {
  if (!req.session.username) {
    return res.redirect('/');
  }

  let imageUrl = req.session.imageUrl;

  if (!imageUrl) {
    imageUrl = await getRandomImage();
    req.session.imageUrl = imageUrl; 
  }

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const username = req.session.username;

  const user = await User.findOne({ username: username });

  res.render('home', { imageUrl, currentTime, username, tasks: user.tasks });
});

router.post('/addTask', async (req, res) => {
  const { taskName } = req.body;
  const username = req.session.username;
  
  if (!username) {
    return res.status(401).send('Unauthorized');
  }

  await User.findOneAndUpdate(
    { username: username },
    { $push: { tasks: { name: taskName } } }
  );

  res.redirect('/home');
});

router.post('/toggleTask/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const username = req.session.username;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send('User not found');
    }

    const task = user.tasks.id(taskId);
    if (task) {
      task.completed = !task.completed;
      await user.save();
    } else {
      return res.status(404).send('Task not found');
    }

    res.redirect('/home');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/deleteTask/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const username = req.session.username;

    const user = await User.findOneAndUpdate(
      { username },
      { $pull: { tasks: { _id: taskId } } }
    );

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.redirect('/home');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/changeBackground', async (req, res) => {
  const newImageUrl = await getRandomImage();
  req.session.imageUrl = newImageUrl; 
  res.json({ imageUrl: newImageUrl });
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.redirect('/');
  });
});

module.exports = router;
