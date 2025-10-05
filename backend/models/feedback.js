const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userType: {
        type: String,
        required: true,
        enum: ['student', 'institute']
    },
    benefits: [{
        type: String
    }],
    futureUse: {
        type: Boolean,
        required: true
    },
    suggestions: {
        type: String,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Feedback', feedbackSchema);