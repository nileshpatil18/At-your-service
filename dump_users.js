const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'users.db');
const outTxt = path.join(__dirname, 'users_dump.txt');

function writeNotepadDump(rows) {
  // Write header and email/phone lines with CRLF so Notepad displays correctly
  const header = 'id\tusername\temail\tphone\r\n';
  const lines = rows.map(r => `${r.id}\t${r.username || ''}\t${r.email || ''}\t${r.phone || ''}`).join('\r\n');
  fs.writeFileSync(outTxt, header + lines + '\r\n', 'utf8');
}

function main() {
  if (!fs.existsSync(dbPath)) {
    console.error('Database file not found at', dbPath);
    process.exit(1);
  }

  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Failed to open DB:', err.message);
      process.exit(1);
    }
  });

  db.all('SELECT id, username, email, phone, address, role FROM users', (err, rows) => {
    if (err) {
      console.error('Query error:', err.message);
      try { db.close(); } catch (e) {}
      process.exit(1);
    }

    if (!rows || rows.length === 0) {
      console.log('No users found.');
      try { fs.writeFileSync(outTxt, 'No users found.\r\n', 'utf8'); } catch (e) { console.error('Write error:', e.message); }
      try { db.close(); } catch (e) {}
      return;
    }

    // Print JSON to console
    console.log(JSON.stringify(rows, null, 2));

    // Write Notepad-friendly dump
    try {
      writeNotepadDump(rows);
      console.log('Wrote Notepad-friendly dump to', outTxt);
    } catch (e) {
      console.error('Failed to write dump:', e.message);
    }

    try { db.close(); } catch (e) {}
  });
}

main();
