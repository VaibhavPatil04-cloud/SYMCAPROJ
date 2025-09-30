const express = require('express');
const auth = require('../middleware/authMiddleware');
const Feedback = require('../models/feedback');

const router = express.Router();

// Admin route to get feedback (protected)
router.get('/feedback', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin rights required.'
            });
        }

        const feedbacks = await Feedback.find().sort({ submittedAt: -1 });
        
        res.json({
            success: true,
            data: feedbacks
        });

    } catch (error) {
        console.error('Admin feedback fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;