const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: String,
    description: String,
    type: { type: String, enum: ['job', 'internship', 'freelance'], required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requirements: [String],
    salaryRange: String,
    applicationLink: String, // External link or internal application
    applicants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['applied', 'reviewing', 'rejected', 'hired'], default: 'applied' },
        date: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);
