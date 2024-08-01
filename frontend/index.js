const express = require('express');
const app = express();
const PORT = 2000;
const path = require('path');

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages/main.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages/register.html'));
});

const topicRouter = express.Router();
topicRouter.get('/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages/topic.html'));
});
topicRouter.get('/:id/submit', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages/submit.html'));
});
app.use('/topic', topicRouter);

/**app.get('/topic/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages/topic.html'));
});**/

app.get('/post/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages/post.html'));
});

app.listen(PORT, '192.168.1.70', () => {
  console.log(`Listening at http:\\localhost:${PORT}`);
});

module.exports = app;