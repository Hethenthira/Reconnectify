const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://angamuthutamilarasi4353_db_user:Rzr2y3UDuSSPLbY0@cluster0.muwqcy8.mongodb.net/reconnectify?appName=Cluster0", {
        });
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
