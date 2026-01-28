const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'rishi123',
  database: 'user_auth'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('MySQL Connected');
});

module.exports = db;
