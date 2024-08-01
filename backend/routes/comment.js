const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// Get comment
router.get('/comments/:id', async(req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const author = await User.findById(comment.author);
    if (!author) {
      return res.status(404).json({ message: 'Unregistered author' });
    }

    res.json({
      id: comment._id,
      content: comment.content,
      author: { id: comment.author, name: author.name },
      dateCreated: comment.dateCreated,
      repliedTo: comment.repliedTo,
      replies: comment.replies, 
      post: comment.post
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({message: 'Server Error'});
  }
});

// Comment on post
router.post(
  '/posts/:id/comment',
  [auth, [check('content', 'Content is required')]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Invalid inputs' });
    }

    try {
      console.log("here");
      const post = await Post.findById(req.body.post);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const comment = new Comment({
        content: req.body.content,
        author: req.session.userId,
        post: post._id,
      });
      
      await comment.save();

      // Return json
      res.json({
        id: comment._id,
        content: comment.content,
        author: { id: req.session.userId, name: req.session.userName },
        dateCreated: comment.dateCreated,
        post: comment.post
      });

    } catch (err) {
      console.error(err.message);
      res.status(500).json({message: 'Server Error'});
    }
  }
);

// Comment on comment
router.post(
  '/comments/:id/reply', 
  [auth, [check('content', 'Content is required')]], 
  async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Invalid inputs' });
    }

    try {
      const post = await Post.findById(req.body.post);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      const parcom = await Comment.findOne({ _id: req.body.comment });
      if (!parcom) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
      
      const comment = new Comment({
        content: req.body.content,
        author: req.session.userId,
        post: post._id,
        repliedTo: req.body.comment,
      });
      
      await comment.save();

      // Return json
      res.json({
        id: comment._id,
        content: comment.content,
        author: { id: req.session.userId, name: req.session.userName },
        dateCreated: comment.dateCreated,
        repliedTo: comment.repliedTo,
        post: comment.post
      });

    } catch (err) {
      console.error(err.message);
      res.status(500).json({message: 'Server Error'});
    }
  }
);

// Delete comment by ID
router.delete('/comments/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id, author: req.session.userId });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    await comment.deleteOne();
    res.status(204).json({ message: 'Comment deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({message: 'Server Error'});
  }
});

module.exports = router;