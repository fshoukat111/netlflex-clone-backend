const mysql = require('mysql');
const fs = require('fs');

// MySQL connection configuration
const connection = mysql.createConnection({
    host: 'netflixdbserver.mysql.database.azure.com',
    user: 'tester',
    password: '@Myproject',
    database: 'netflix_db',
    ssl: {
    }

});

// Connect to MySQL
connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

module.exports = connection;
