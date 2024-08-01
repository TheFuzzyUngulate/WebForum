const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/user');
const Topic = require('../models/topic');
const Comment = require('../models/comment');
const auth = require('../middleware/auth');
// const { check, validationResult } = require('express-validator');

// Get post by ID
router.get('/posts/:id/', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const author = await User.findById(post.author);
    if (!author) {
      return res.status(404).json({ message: 'Unregistered author' });
    }

    const result = {
      title: post.title,
      author: {
        id: author._id,
        name: author.name
      },
      description: post.description,
      dateCreated: post.dateCreated,
      lastUpdated: post.lastUpdated,
      comments: []
    };

    const comments = await Comment.find({ post: post._id }).sort({ dateCreated: -1 });
    
    if (comments) {
      for (var i = 0; i < comments.length; ++i) {
        const item = comments[i];
        const commentAuthor = await User.findById(item.author);
        if (!commentAuthor) continue;
        result.comments.push(item._id);
      }
    }

    res.json(result);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({message: 'Server Error'});
  }
});

router.get('/posts/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const result = { comments: [] };
    const comments = await Comment.find({ post: post._id }).sort({ dateCreated: -1 });
    
    if (comments) {
      for (var i = 0; i < comments.length; ++i) {
        const comment = comments[i];
        const author = await User.findById(comment.author);
        if (!author) continue;
        result.comments.push({
          id: comment._id,
          content: comment.content,
          author: { id: comment.author, name: author.name },
          dateCreated: comment.dateCreated,
          repliedTo: comment.repliedTo,
          replies: comment.replies,
          post: comment.post
        });
      }
    }
    
    // Return json
    res.json(result);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).json({message: 'Server Error'});
  }
});

// Create a new post
router.post('/posts', auth, async(req, res) => {
  try {
    // Create a new post
    const post = new Post({
      title: req.body.title,
      description: req.body.description,
      author: req.session.userId,
      topic: req.body.topic,
    });

    const checkAuthor = await User.findById(post.author);
    if (!checkAuthor) {
      return res.status(404).json({ message: "Author not found" });
    }

    const checkTopic = await Topic.findOne({ name: post.topic });
    if (!checkTopic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Save the post
    await post.save();

    // Return json
    res.json({
      id: post._id,
      title: post.title,
      description: post.description,
      dateCreated: post.dateCreated,
      lastUpdated: post.dateUpdated,
      topic: post.topic,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({message: 'Server Error'});
  }
});

// Delete post by ID
router.delete('/posts/:id', auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, author: req.session.userId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    await post.deleteOne();
    return res.status(204).json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({message: 'Server Error'});
  }
});

module.exports = router;