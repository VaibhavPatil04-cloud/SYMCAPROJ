const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedback');

// SIMPLE FEEDBACK ROUTE THAT WILL DEFINITELY WORK
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

// Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Feedback test route working!'
    });
});

module.exports = router;