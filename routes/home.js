const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');

let cachedImageUrl = null;

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

  // Fetch a new image if not set or if user requests a new one
  if (!imageUrl) {
    imageUrl = await getRandomImage();
    req.session.imageUrl = imageUrl; // Save to session
  }

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const username = req.session.username;

  const user = await User.findOne({ username: username });

  res.render('home', { imageUrl, currentTime, username, tasks: user.tasks });
});

router.post('/addTask', async (req, res) => {
  const { taskName } = req.body;
  const username = req.session.username;

  await User.findOneAndUpdate(
    { username: username },
    { $push: { tasks: { name: taskName } } }
  );

  res.redirect('/home');
});

router.post('/toggleTask/:id', async (req, res) => {
  const taskId = req.params.id;
  const username = req.session.username;

  const user = await User.findOne({ username: username });
  const task = user.tasks.id(taskId);

  if (task) {
    task.completed = !task.completed;
    await user.save();
  }

  res.redirect('/home');
});

// Delete a task
router.post('/deleteTask/:id', async (req, res) => {
  const taskId = req.params.id;
  const username = req.session.username;

  await User.findOneAndUpdate(
    { username: username },
    { $pull: { tasks: { _id: taskId } } }
  );

  res.redirect('/home');
});

// Change Background route
router.post('/changeBackground', async (req, res) => {
  const newImageUrl = await getRandomImage();
  req.session.imageUrl = newImageUrl; // Update session image URL
  res.json({ imageUrl: newImageUrl });
});

module.exports = router;
