const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedback');

// Get all feedbacks
router.get('/all', async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ submittedAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        res.status(500).json({ message: 'Error fetching feedbacks' });
    }
});

// Submit new feedback
router.post('/submit', async (req, res) => {
    try {
        console.log('📝 Received feedback:', req.body);

        const feedback = new Feedback({
            userType: req.body.userType,
            benefits: req.body.benefits,
            futureUse: req.body.futureUse,
            suggestions: req.body.suggestions,
            rating: req.body.rating
        });

        await feedback.save();
        console.log('✅ Feedback saved:', feedback._id);

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            feedbackId: feedback._id
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error submitting feedback'
        });
    }
});

// Delete feedback
router.delete('/:id', async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({ message: 'Error deleting feedback' });
    }
});

// Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Feedback test route working!'
    });
});

module.exports = router;