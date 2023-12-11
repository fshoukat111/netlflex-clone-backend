// auth.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db'); // Import the database connection

async function signup(username, email, password, role, age) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const defaultRole = role || 'viewer';

  const query = 'INSERT INTO users (username, email, password, role,age) VALUES (?, ?, ?, ?,?)';

  return new Promise((resolve, reject) => {
    db.query(query, [username, email, hashedPassword, defaultRole, age], (err, result) => {
      if (err) {
        console.error('Error signing up:', err);
        reject('Error signing up');
        return;
      }
      resolve(result);
    });
  });
}

function signin(username, password) {
  const query = 'SELECT * FROM users WHERE username = ?';
  return new Promise((resolve, reject) => {
    db.query(query, [username], async (err, result) => {
      if (err) {
        console.error('Error signing in:', err);
        reject('Error signing in');
        return;
      }

      if (result.length === 0) {
        reject('Invalid username or password');
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, result[0].password);
      if (!isPasswordValid) {
        reject('Invalid username or password');
        return;
      }

      const { id, username, email, role, age } = result[0];

      const token = jwt.sign(
        { userId: id, username, email, role },
        'your_secret_key',
        { expiresIn: '1h' }
      );

      // Return an object containing the token and user role
      resolve({ token, role, age });
    });
  });
}

module.exports = { signup, signin };
