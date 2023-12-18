const db = require('../database/db'); // Import the database connection




async function createVideo(videoData) {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS videos (
            id INT PRIMARY KEY AUTO_INCREMENT,
            contentTitle VARCHAR(255) NOT NULL,
            producer VARCHAR(255) NOT NULL,
            genre VARCHAR(255) NOT NULL,
            publisher VARCHAR(255) NOT NULL,
            videoUrl VARCHAR(255) NOT NULL,
            pg INT,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
    `;

    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO videos SET ?';

        db.query(createTableQuery, (createTableErr) => {
            if (createTableErr) {
                console.error('Error creating table:', createTableErr);
                reject('Error creating table');
                return;
            }

            db.query(query, videoData, (error, results) => {
                if (error) {
                    console.error('Error executing query:', error);
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    });
}
async function getVideos(searchQuery) {
    return new Promise((resolve, reject) => {
        let query = 'SELECT * FROM videos';
        if (searchQuery) {
            query += ` WHERE contentTitle LIKE '%${searchQuery}%' OR contentTitle LIKE '%${searchQuery}%'`;
        }
        // Add ORDER BY clause to sort by the 'date' column in descending order
        query += ' ORDER BY date DESC';

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

async function getVideoById(videoId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM videos WHERE id = ?';

        // Assuming db is a valid database connection
        db.query(query, [videoId], (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
            } else {
                // Assuming there should be only one video with a given ID
                const video = results[0];
                resolve(video);
            }
        });
    });
}

async function addVideoFeedBack(videoId, comment, rating) {
    return new Promise((resolve, reject) => {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS feedback (
                id INT PRIMARY KEY AUTO_INCREMENT,
                video_id INT,
                comment VARCHAR(255) NOT NULL,
                rating INT
            )
        `;

        const query = 'INSERT INTO feedback (video_id, comment, rating) VALUES (?, ?, ?)';
        db.query(createTableQuery, (createTableErr) => {
            if (createTableErr) {
                console.error('Error creating table:', createTableErr);
                reject('Error creating table');
                return;
            }

            db.query(query, [videoId, comment, rating], (error) => {
                if (error) {
                    console.error('Error adding feedback:', error);
                    reject('Internal Server Error');
                } else {
                    console.log('Comment and rating added successfully');
                    resolve();
                }
            });
        });
    });
}



async function getfeedbackByVideoId(videoId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM feedback WHERE video_id = ?';
        db.query(
            query,
            [videoId],
            (error, results) => {
                if (error) {
                    console.error(500).json({ error: 'Internal Server Error' });
                } else {
                    resolve(results);
                }
            }
        );;
    });
}



async function updateVideo(videoId, updatedVideoData) {
    const { contentTitle, producer, genre, publisher, videoUrl } = updatedVideoData;
    const query = 'UPDATE videos SET contentTitle = ?, producer = ?, genre = ?, publisher = ?, videoUrl = ? WHERE id = ?';
    return new Promise((resolve, reject) => {
        db.query(query, [contentTitle, producer, genre, publisher, videoUrl, videoId], (error, results) => {
            if (error) {
                console.error('Error updating video:', error);
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

module.exports = {
    createVideo, getVideos, getVideoById,
    updateVideo,
    addVideoFeedBack,
    getfeedbackByVideoId,
}