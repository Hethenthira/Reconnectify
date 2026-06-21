const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    imageUrl: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);
