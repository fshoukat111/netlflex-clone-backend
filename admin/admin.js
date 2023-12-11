const db = require('../database/db'); // Import the database connection

async function getUsers() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users';

        db.query(query, (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

async function getUserById(userId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE id = ?';

        // Assuming db is a valid database connection
        db.query(query, [userId], (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
            } else {
                // Assuming there should be only one video with a given ID
                const user = results[0];
                resolve(user);
            }
        });
    });
}

async function updateUserRole(userId, role) {
    console.log("role", role)
    const query = 'UPDATE users SET role = ? WHERE id = ?';

    return new Promise((resolve, reject) => {
        db.query(query, [role, userId], (error, results) => {
            if (error) {
                console.error('Error updating user role:', error);
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

async function deleteUserById(userId) {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM users WHERE id = ?';

        // Assuming db is a valid database connection
        db.query(query, [userId], (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
            } else {
                // Check if any rows were affected to determine if the user was deleted
                const deletedRows = results.affectedRows;
                if (deletedRows > 0) {
                    resolve(`User with ID ${userId} deleted successfully`);
                } else {
                    reject(`User with ID ${userId} not found`);
                }
            }
        });
    });
}

module.exports = { getUsers, updateUserRole, getUserById,deleteUserById }