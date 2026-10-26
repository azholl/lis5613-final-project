const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const escapeHtml = require('escape-html');
const validator = require('validator');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'PasswordPlaceholder',
  database: 'blog_platform'
});

connection.connect((error) => {
  if (error) {
    console.error('Database connection failed:', error.message);
    return;
  }
  console.log('Successfully connected to the database.');
});

function validatePostInput(title, author, content) {
  if (validator.isEmpty(title || '', { ignore_whitespace: true })) {
    return 'Title is required.';
  }

  if (validator.isEmpty(author || '', { ignore_whitespace: true })) {
    return 'Author is required.';
  }

  if (validator.isEmpty(content || '', { ignore_whitespace: true })) {
    return 'Content is required.';
  }

  if (!validator.isLength(title, { min: 2, max: 255 })) {
    return 'Title must be between 2 and 255 characters.';
  }

  if (!validator.isLength(author, { min: 2, max: 100 })) {
    return 'Author must be between 2 and 100 characters.';
  }

  return null;
}

function cleanPost(post) {
  return {
    id: post.id,
    title: escapeHtml(post.title),
    author: escapeHtml(post.author),
    content: escapeHtml(post.content),
    created_at: post.created_at
  };
}

app.get('/posts', (req, res) => {
  const sql = 'SELECT * FROM posts ORDER BY created_at DESC';

  connection.query(sql, (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Could not retrieve posts.' });
    }

    res.json(results.map(cleanPost));
  });
});

app.post('/posts', (req, res) => {
  const { title, author, content } = req.body;
  const validationError = validatePostInput(title, author, content);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const sql = 'INSERT INTO posts (title, author, content) VALUES (?, ?, ?)';

  connection.query(sql, [title, author, content], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Could not create post.' });
    }

    res.status(201).json({ message: 'Post created successfully.', id: results.insertId });
  });
});

app.put('/posts/:id', (req, res) => {
  const postId = req.params.id;
  const { title, author, content } = req.body;
  const validationError = validatePostInput(title, author, content);

  if (!validator.isInt(postId)) {
    return res.status(400).json({ error: 'Invalid post ID.' });
  }

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const sql = 'UPDATE posts SET title = ?, author = ?, content = ? WHERE id = ?';

  connection.query(sql, [title, author, content, postId], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Could not update post.' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    res.json({ message: 'Post updated successfully.' });
  });
});

app.delete('/posts/:id', (req, res) => {
  const postId = req.params.id;

  if (!validator.isInt(postId)) {
    return res.status(400).json({ error: 'Invalid post ID.' });
  }

  const sql = 'DELETE FROM posts WHERE id = ?';

  connection.query(sql, [postId], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Could not delete post.' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    res.json({ message: 'Post deleted successfully.' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
