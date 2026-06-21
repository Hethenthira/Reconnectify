const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Recipient
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'connection', 'message', 'job', 'event'], default: 'info' },
    read: { type: Boolean, default: false },
    relatedId: mongoose.Schema.Types.ObjectId, // ID of related entity (e.g., event ID, user ID)
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
