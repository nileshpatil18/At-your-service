const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'users.db');
const outTxt = path.join(__dirname, 'users_export.txt');
const outCsv = path.join(__dirname, 'users_export.csv');

function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Failed to open database:', dbPath);
    console.error(err.message);
    process.exit(1);
  }
});

db.all('SELECT id, username, email, phone, address, role FROM users', (err, rows) => {
  if (err) {
    console.error('Query error:', err.message);
    db.close();
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    const msg = 'No users found in the database.\n';
    fs.writeFileSync(outTxt, msg, 'utf8');
    fs.writeFileSync(outCsv, '');
    console.log('No users found. Created empty export files.');
    db.close();
    return;
  }

  // Write plain text file (easy to open in Notepad)
  const lines = [];
  lines.push('id\tusername\temail\tphone\taddress\trole');
  rows.forEach((r) => {
    const line = `${r.id}\t${r.username || ''}\t${r.email || ''}\t${r.phone || ''}\t${r.address || ''}\t${r.role || ''}`;
    lines.push(line);
  });
  fs.writeFileSync(outTxt, lines.join('\n'), 'utf8');

  // Write CSV file too
  const csvLines = [];
  csvLines.push(['id','username','email','phone','address','role'].join(','));
  rows.forEach((r) => {
    csvLines.push([
      escapeCsv(r.id),
      escapeCsv(r.username),
      escapeCsv(r.email),
      escapeCsv(r.phone),
      escapeCsv(r.address),
      escapeCsv(r.role)
    ].join(','));
  });
  fs.writeFileSync(outCsv, csvLines.join('\n'), 'utf8');

  console.log(`Exported ${rows.length} user(s) to:`);
  console.log(' -', outTxt);
  console.log(' -', outCsv);

  db.close();
});
