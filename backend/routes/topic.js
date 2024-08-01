const express = require('express');
const router = express.Router();
const Topic = require('../models/topic');
const Post = require('../models/post');

// Get all topic IDs
router.get('/all-topics', async (req, res) => {
  try {
    const topics = await Topic.find({});
    if (!topics) {
      return res.status(404).json({ message: "Topics not found" });
    }
    
    const result = {
      topics: []
    }

    for (let topic of topics) {
      result.topics.push({
        name: topic.name,
        description: topic.description,
        postCount: topic.posts.length
      });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({message: 'Server Error'});
  }
});

// Get topic by ID
router.get('/topic/:id', async (req, res) => {
  try {
    const topic = await Topic.findOne({ name: req.params.id });
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }
    res.json({
      name: topic.name,
      description: topic.description,
      postCount: topic.posts.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({message: 'Server Error'});
  }
});

// Get posts in topic
router.get('/topic/:id/posts', async (req, res) => {
  try {
    const topic = await Topic.findOne({ name: req.params.id });
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const posts = await Post.find({ topic: topic.name }).sort({ lastUpdated: -1 });
    if (!posts) {
      return res.status(404).json({ message: "Posts not found" });
    }
  
    const result = { name: topic.name, description: topic.description, posts: []};

    for (let item of posts) {
      result.posts.push({
        id: item._id,
        title: item.title,
        author: item.author,
        description: item.description,
        dateCreated: item.dateCreated,
        lastUpdated: item.lastUpdated,
        commentCount: item.comments.length
      });
    }

    res.json(result);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).json({message: 'Server Error'});
  }
});

module.exports = router;