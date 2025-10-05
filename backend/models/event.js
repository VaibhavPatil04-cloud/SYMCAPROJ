const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true,
        trim: true
    },
    eventType: {
        type: String,
        required: true,
        enum: ['hackathon', 'coding-competition', 'project-expo', 'workshop']
    },
    description: {
        type: String,
        required: true
    },
    eventDate: {
        type: Date,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    timings: String,
    fees: {
        type: Number,
        default: 0
    },
    capacity: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Ended', 'Cancelled'],
        default: 'Active'
    },
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    registeredStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
