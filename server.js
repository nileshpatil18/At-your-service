const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      role TEXT
    )`);
  }
});

// Registration endpoint
app.post('/register', (req, res) => {
  const { username, password, email, phone, address, role } = req.body;
  db.run('INSERT INTO users (username, password, email, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)', [username, password, email, phone, address, role || 'user'], function(err) {
    if (err) {
      return res.status(400).json({ message: 'User already exists or error occurred.' });
    }
    res.json({ message: 'Registration successful!' });
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (row) {
      res.json({
        message: 'Login successful!',
        email: row.email,
        phone: row.phone,
        address: row.address,
        role: row.role
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials.' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
