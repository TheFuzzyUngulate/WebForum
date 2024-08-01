const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const cors = require('cors');
const MongoStore = require('connect-mongo');
const app = express();

const connectDB = require('./db');
const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const commentRouter = require('./routes/comment');
const topicRouter = require('./routes/topic');

dotenv.config();
const HOSTNAME = process.env.HOSTNAME || 'localhost' ;
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUnitialized: true,
  cookie: {
    secure: false, 
    maxAge: 30 * 60 * 1000 
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URL,
    crypto: { secret: process.env.MONGODB_CRYPTO_SECRET }
  })
}));

app.use('/api', userRouter);
app.use('/api', authRouter);
app.use('/api', postRouter);
app.use('/api', topicRouter);
app.use('/api', commentRouter);

app.listen(PORT, `${HOSTNAME}`, () => {
  console.log(`Server started at http://${HOSTNAME}/${PORT}`);
});

module.exports = app;