const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const topicSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }]
});

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;