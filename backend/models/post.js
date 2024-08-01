const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const postSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    required: true,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now
  },
  topic: {
    type: String,
    required: true,
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }]
});

postSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      await mongoose.model('User').findByIdAndUpdate(
        this.author,
        { $push: { posts: this._id } },
        { new : true }
      );
      await mongoose.model('Topic').findOneAndUpdate(
        { name: this.topic },
        { $push: { posts: this._id } },
        { new: true }
      );
    } catch (err) {
      return next(err);
    }
  }
  next();
});

postSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    await mongoose.model('Comment').deleteMany(
      { post: this._id }
    );
    await mongoose.model('Topic').findOneAndUpdate(
      { name: this.topic },
      { $pull: { posts: this._id } }
    );
    await mongoose.model('User').findByIdAndUpdate(
      this.author,
      { $pull : { posts: this._id } }
    );
  } catch (err) {
    return next(err);
  }
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;