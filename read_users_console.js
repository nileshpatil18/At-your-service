const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'users.db');
const outTxt = path.join(__dirname, 'users_export.txt');

console.log('Opening database:', dbPath);
let db;
try {
  db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
} catch (e) {
  console.error('Failed to open database:', e.message);
  process.exit(1);
}

db.all('SELECT id, username, email, phone, address, role FROM users', (err, rows) => {
  if (err) {
    console.error('Query error:', err ? err.message : err);
    try { db.close(); } catch (e) {}
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    const msg = 'No users found in the database.';
    console.log(msg);
    try { fs.writeFileSync(outTxt, msg + '\r\n', 'utf8'); console.log('Wrote empty export to', outTxt); } catch (e) { console.error('Failed to write export file:', e.message); }
    try { db.close(); } catch (e) {}
    return;
  }

  console.log(`Found ${rows.length} user(s):`);
  rows.forEach((r) => {
    console.log(JSON.stringify(r));
  });

  // Write a Notepad-friendly text file (UTF-8 with CRLF)
  const header = 'id\tusername\temail\tphone\taddress\trole\r\n';
  const lines = rows.map(r => `${r.id}\t${r.username || ''}\t${r.email || ''}\t${r.phone || ''}\t${r.address || ''}\t${r.role || ''}`).join('\r\n');
  try {
    fs.writeFileSync(outTxt, header + lines + '\r\n', 'utf8');
    console.log('Wrote plain-text export to', outTxt);
  } catch (e) {
    console.error('Failed to write export file:', e.message);
  }

  try { db.close(); } catch (e) {}
});
