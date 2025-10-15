const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/user');
const Event = require('../models/event');

// Get admin dashboard statistics
router.get('/stats', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalInstitutes = await User.countDocuments({ role: 'institute' });
        const totalEvents = await Event.countDocuments();
        const totalUsers = totalStudents + totalInstitutes;

        res.json({
            success: true,
            totalUsers,
            totalEvents,
            totalStudents,
            totalInstitutes
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, message: 'Error fetching statistics' });
    }
});

// Get all students
router.get('/students', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const students = await User.find({ role: 'student' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({ success: true, students });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ success: false, message: 'Error fetching students' });
    }
});

// Get all events
router.get('/events', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const events = await Event.find()
            .populate('instituteId', 'instituteName')
            .sort({ createdAt: -1 });

        res.json({ success: true, events });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ success: false, message: 'Error fetching events' });
    }
});

// Get all institutes
router.get('/institutes', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const institutes = await User.find({ role: 'institute' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({ success: true, institutes });
    } catch (error) {
        console.error('Get institutes error:', error);
        res.status(500).json({ success: false, message: 'Error fetching institutes' });
    }
});

// Update institute status (approve/reject)
router.patch('/institutes/:id/status', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { status } = req.body;
        const institute = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).select('-password');

        res.json({ success: true, institute });
    } catch (error) {
        console.error('Update institute status error:', error);
        res.status(500).json({ success: false, message: 'Error updating institute status' });
    }
});

module.exports = router;
