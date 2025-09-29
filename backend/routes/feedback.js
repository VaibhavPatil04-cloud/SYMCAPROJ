const express = require('express');
const router = express.Router();

// SIMPLE FEEDBACK ROUTE THAT WILL DEFINITELY WORK
router.post('/submit', (req, res) => {
    console.log('🎯 FEEDBACK ROUTE HIT SUCCESSFULLY!', req.body);
    
    res.json({
        success: true,
        message: 'Feedback received successfully!',
        data: req.body,
        timestamp: new Date().toISOString(),
        route: 'feedback.js router'
    });
});

// Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Feedback test route working!'
    });
});

module.exports = router;