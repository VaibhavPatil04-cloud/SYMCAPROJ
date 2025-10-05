const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Event = require('../models/event');

// Create event
router.post('/create', auth, async (req, res) => {
    try {
        const event = new Event({
            ...req.body,
            instituteId: req.user.userId
        });
        await event.save();
        res.status(201).json({ success: true, event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get institute events
router.get('/institute', auth, async (req, res) => {
    try {
        const events = await Event.find({ instituteId: req.user.userId })
            .sort({ createdAt: -1 });
        res.json({ success: true, events });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get event details
router.get('/:id', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        res.json({ success: true, event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update event status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const event = await Event.findOneAndUpdate(
            { _id: req.params.id, instituteId: req.user.userId },
            { status: req.body.status },
            { new: true }
        );
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        res.json({ success: true, event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
