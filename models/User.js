const mongoose = require('mongoose');

// Define the Task Schema (embedded in the User schema)
const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  tasks: [taskSchema]  // Embed tasks in the user schema
});

module.exports = mongoose.model('User', userSchema);
