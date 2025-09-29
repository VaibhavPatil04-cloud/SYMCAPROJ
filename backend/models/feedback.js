const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userType: {
        type: String,
        required: true,
        enum: ['student', 'institute']
    },
    benefits: [{
        type: String,
        enum: ['event_discovery', 'networking', 'campus_engagement', 'skill_development']
    }],
    futureUse: {
        type: String,
        required: true,
        enum: ['yes', 'no']
    },
    suggestions: {
        type: String,
        trim: true,
        maxlength: 1000
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
    },
    userAgent: {
        type: String,
        trim: true
    },
    ipAddress: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for better query performance
feedbackSchema.index({ submittedAt: -1 });
feedbackSchema.index({ userType: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);