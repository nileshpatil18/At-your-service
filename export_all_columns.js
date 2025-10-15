const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'users.db');
const outTxt = path.join(__dirname, 'users_export.txt');
const outCsv = path.join(__dirname, 'users_export.csv');

function toCsv(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
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
    db.close();
    process.exit(1);
  }

  if (!cols || cols.length === 0) {
    console.error('No users table or no columns found');
    db.close();
    process.exit(1);
  }

  const columnNames = cols.map(c => c.name);
  const selectSql = `SELECT ${columnNames.join(', ')} FROM users`;

  db.all(selectSql, (err2, rows) => {
    if (err2) {
      console.error('SELECT error:', err2.message);
      db.close();
      process.exit(1);
    }

    // TXT (tab-separated, CRLF)
    const header = columnNames.join('\t') + '\r\n';
    const txtLines = rows.map(r => columnNames.map(c => (r[c] !== undefined ? String(r[c]) : '')).join('\t'));
    try {
      fs.writeFileSync(outTxt, header + txtLines.join('\r\n') + '\r\n', 'utf8');
      console.log('Wrote', outTxt);
    } catch (e) {
      console.error('Failed to write TXT:', e.message);
    }

    // CSV
    const csvHeader = columnNames.join(',');
    const csvLines = rows.map(r => columnNames.map(c => toCsv(r[c])).join(','));
    try {
      fs.writeFileSync(outCsv, csvHeader + '\n' + csvLines.join('\n') + '\n', 'utf8');
      console.log('Wrote', outCsv);
    } catch (e) {
      console.error('Failed to write CSV:', e.message);
    }

    db.close();
  });
});
