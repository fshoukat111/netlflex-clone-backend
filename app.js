// app.js
const express = require('express');
const bodyParser = require('body-parser');
const auth = require('./users/auth');
const adminRequest = require('./admin/admin.js');
const creatorRequest = require('./creators/creators.js');
const cors = require('cors')
const app = express();
const port = 5000;
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');

// Azure Blob Storage configuration
const AZURE_STORAGE_CONNECTION_STRING = 'DefaultEndpointsProtocol=https;AccountName=videoscontent;AccountKey=KSXgjM41tF2DW3vuk6DcN741fdEJNBKON5Jirmo7A2le63YkPvQY0lkzXJlaVLFGJDOCK2iRysDI+ASt9+ATzg==;EndpointSuffix=core.windows.net';
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerName = 'videos';
const containerClient = blobServiceClient.getContainerClient(containerName);


app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.post('/signup', async (req, res) => {
    const { username, email, role, password, age } = req.body;
    try {
        const userId = await auth.signup(username, email, password, role, age);
        res.status(201).json({ message: 'User signed up successfully', userId });
    } catch (error) {
        res.status(500).json({ error });
    }
});

app.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    try {
        const token = await auth.signin(username, password);
        res.status(200).json({ message: 'User signed in successfully', token });
    } catch (error) {
        res.status(401).json({ error });
    }
});


app.get('/admin/users', async (req, res) => {
    try {
        const adminUsers = await adminRequest.getUsers();
        res.status(200).json({ message: 'Users fetched successfully', users: adminUsers });
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

app.get('/user/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await adminRequest.getUserById(userId);

        if (user) {
            res.status(200).json({ message: 'user fetched successfully', user });
        } else {
            res.status(404).json({ error: 'Not Found', message: 'Video not found' });
        }
    } catch (error) {
        console.error('Error fetching video by ID:', error);
        res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch video' });
    }
});

app.put('/admin/update/:id', async (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;

    try {
        // Assuming you have a function to update user role in the database
        await adminRequest.updateUserRole(userId, role);

        res.status(200).json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/admin/delete/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Assuming you have a function to update user role in the database
        await adminRequest.deleteUserById(userId);

        res.status(200).json({ message: 'User delete successfully' });
    } catch (error) {
        console.error('Error delete user role:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/create-videos', upload.single('videoUrl'), async (req, res) => {
    try {
        console.log(req.file);
        const blobName = Date.now() + '-' + req.file.originalname;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(req.file.buffer, req.file.size);
        const videoData = {
            contentTitle: req.body.contentTitle,
            producer: req.body.producer,
            genre: req.body.genre,
            publisher: req.body.publisher,
            videoUrl: blockBlobClient.url,
            pg: req.body.pg,
        };
        const result = await creatorRequest.createVideo(videoData);

        console.log('Video data inserted successfully:', result);
        res.send('File uploaded and video data inserted!');
    } catch (error) {
        console.error('Error handling video upload:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/videos', async (req, res) => {
    try {
        const searchQuery = req.query.search;
        const videosList = await creatorRequest.getVideos(searchQuery);

        const responseMessage = searchQuery
            ? 'Searched videos fetched successfully'
            : 'All videos fetched successfully';

        res.status(200).json({ message: responseMessage, videos: videosList });
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

app.get('/video/:id', async (req, res) => {
    const videoId = req.params.id;

    try {
        const video = await creatorRequest.getVideoById(videoId);

        if (video) {
            res.status(200).json({ message: 'Video fetched successfully', video });
        } else {
            res.status(404).json({ error: 'Not Found', message: 'Video not found' });
        }
    } catch (error) {
        console.error('Error fetching video by ID:', error);
        res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch video' });
    }
});

app.get('/video/feedback/:id', async (req, res) => {
    const videoId = req.params.id;
    try {
        const video = await creatorRequest.getfeedbackByVideoId(videoId);

        if (video) {
            res.status(200).json({ message: 'Video fetched successfully', video });
        } else {
            res.status(404).json({ error: 'Not Found', message: 'Video not found' });
        }
    } catch (error) {
        console.error('Error fetching video by ID:', error);
        res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch video' });
    }

});

// API endpoint to add a comment and rating for a video
app.post('/video/create/:id/feedback', async (req, res) => {
    try {
        const videoId = req.params.id;
        const { comment, rating } = req.body;

        await creatorRequest.addVideoFeedBack(videoId, comment, rating);

        console.log('Feedback successfully added');
        res.send('Feedback inserted!');
    } catch (error) {
        console.error('Error handling video feedback:', error);
        res.status(500).send(error); // Pass the specific error message
    }
});




app.put('/update-video/:videoId', upload.single('videoUrl'), async (req, res) => {
    try {
        const videoId = req.params.videoId;

        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'video', folder: 'videos' },
            (error, result) => {
                if (error) {
                    console.error('Error uploading to Cloudinary:', error);
                    res.status(500).send('Internal Server Error');
                } else {
                    // Prepare updated video data
                    const updatedVideoData = {
                        contentTitle: req.body.contentTitle,
                        producer: req.body.producer,
                        genre: req.body.genre,
                        publisher: req.body.publisher,
                        videoUrl: result.secure_url,
                    };
                    console.log("updatedVideoData", updatedVideoData);

                    // Update video data in the database
                    creatorRequest.updateUserRole(videoId, updatedVideoData)
                        .then((databaseResult) => {
                            console.log('Video data updated successfully:', databaseResult);
                            res.send('File uploaded and video data updated!');
                        })
                        .catch((dbError) => {
                            console.error('Error updating in MySQL:', dbError);
                            res.status(500).send('Internal Server Error');
                        });
                }
            }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (error) {
        console.error('Error handling video update:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
