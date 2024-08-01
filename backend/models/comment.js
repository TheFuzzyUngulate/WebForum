const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const commentSchema = mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dateCreated: {
    type: Date,
    required: true,
    default: Date.now,
  },
  repliedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  }
});

commentSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      await mongoose.model('User').findByIdAndUpdate(
        this.author,
        { $push: { comments: this._id } },
        { new : true }
      );
      await mongoose.model('Post').findByIdAndUpdate(
        this.post,
        { $push: { comments: this._id }, lastUpdated: Date.now() },
        { new: true }
      );
      if (this.repliedTo) {
        await mongoose.model('Comment').findByIdAndUpdate(
          this.repliedTo,
          { $inc: { numberOfReplies: 1 } },
          { new: true }
        );
      }
    } catch (err) {
      return next(err);
    }
  }
  next();
});

commentSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  await mongoose.model('User').findByIdAndUpdate(
    this.author,
    { $pull: { comments: this._id }}
  );
  await mongoose.model('Post').findByIdAndUpdate(
    this.post,
    { $pull: { comments: this._id } }
  );
  if (this.repliedTo) {
    await mongoose.model('Comment').findByIdAndUpdate(
      this.repliedTo,
      { $inc : { numberOfReplies: -1 } }
    );
  }
  next();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;