const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'users.db');

function inspect() {
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Failed to open DB:', err.message);
      process.exit(1);
    }
  });

  db.all("PRAGMA table_info('users')", (err, cols) => {
    if (err) {
      console.error('PRAGMA error:', err.message);
      db.close();
      process.exit(1);
    }

    console.log('users table columns:');
    cols.forEach(c => console.log(` - ${c.name} (type=${c.type}, pk=${c.pk}, notnull=${c.notnull})`));

    db.all('SELECT * FROM users LIMIT 10', (err2, rows) => {
      if (err2) {
        console.error('SELECT error:', err2.message);
        db.close();
        process.exit(0);
      }

      console.log('\nSample rows (up to 10):');
      rows.forEach(r => console.log(JSON.stringify(r)));

      db.close();
    });
  });
}

inspect();
