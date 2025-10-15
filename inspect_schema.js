const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'users.db');
console.log('DB path:', dbPath);
if (!fs.existsSync(dbPath)) {
  console.error('Database file not found');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Failed to open DB:', err.message);
    process.exit(1);
  }
});

db.all("PRAGMA table_info('users')", (err, cols) => {
  if (err) {
    console.error('PRAGMA error:', err.message);
  } else {
    console.log('Table schema (PRAGMA table_info users):');
    console.log(JSON.stringify(cols, null, 2));
  }

  db.get('SELECT * FROM users LIMIT 1', (err2, row) => {
    if (err2) {
      console.error('Sample row error:', err2.message);
    } else {
      console.log('Sample row:');
      console.log(JSON.stringify(row, null, 2));
    }
    try { db.close(); } catch (e) {}
  });
});
