const express = require('express');
const auth = require('../middleware/authMiddleware');
const Feedback = require('../models/feedback');
const router = express.Router();

// Admin route to get feedback (protected)
// Admin route to get feedback (temporarily without auth for testing)
router.get('/feedback', async (req, res) => {
  try {
    console.log('📊 Fetching all feedbacks...');
    
    const feedbacks = await Feedback.find().sort({ submittedAt: -1 });
    
    res.json({
      success: true,
      count: feedbacks.length,
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

// Delete feedback route
router.delete('/feedback/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin rights required.'
      });
    }

    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
