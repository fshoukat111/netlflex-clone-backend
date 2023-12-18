// auth.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db'); // Import the database connection



async function signup(username, email, password, role, age) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const defaultRole = role || 'viewer';

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      age INT
    )
  `;

  const insertUserQuery = 'INSERT INTO users (username, email, password, role, age) VALUES (?, ?, ?, ?, ?)';

  return new Promise((resolve, reject) => {
    // First, create the table if it doesn't exist
    db.query(createTableQuery, (createTableErr) => {
      if (createTableErr) {
        console.error('Error creating table:', createTableErr);
        reject('Error creating table');
        return;
      }

      // Then, insert the user data
      db.query(insertUserQuery, [username, email, hashedPassword, defaultRole, age], (err, result) => {
        if (err) {
          console.error('Error signing up:', err);
          reject('Error signing up');
          return;
        }
        resolve(result);
      });
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
