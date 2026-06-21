const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables if you have a .env file, otherwise we'll use defaults

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// Ideally, use process.env.MONGO_URI from a .env file
const MONGO_URI = "mongodb+srv://angamuthutamilarasi4353_db_user:Rzr2y3UDuSSPLbY0@cluster0.muwqcy8.mongodb.net/reconnectify?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

    
// Routes
// We are using the modular routes found in the 'routes' directory
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/events', require('./routes/events'));
app.use('/api/opportunities', require('./routes/jobs')); // Frontend calls it opportunities
app.use('/api/connections', require('./routes/connections'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/admin', require('./routes/admin'));

// Basic Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));