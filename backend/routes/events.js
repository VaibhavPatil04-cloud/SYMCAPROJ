const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Event = require('../models/event');
const User = require('../models/user');

// Create event (Institute only)
router.post('/create', auth, async (req, res) => {
    try {
        // Check if user is institute
        const user = await User.findById(req.user.userId);
        if (!user || user.role !== 'institute') {
            return res.status(403).json({ 
                success: false, 
                message: 'Only institutes can create events' 
            });
        }

        // Validate dates
        const eventDate = new Date(req.body.eventDate);
        const deadline = new Date(req.body.deadline);
        const today = new Date();

        if (eventDate < today) {
            return res.status(400).json({ 
                success: false, 
                message: 'Event date cannot be in the past' 
            });
        }

        if (deadline > eventDate) {
            return res.status(400).json({ 
                success: false, 
                message: 'Registration deadline must be before event date' 
            });
        }

        const event = new Event({
            ...req.body,
            instituteId: req.user.userId,
            status: 'Active'
        });

        await event.save();
        
        res.status(201).json({ 
            success: true, 
            message: 'Event created successfully',
            event 
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to create event'
        });
    }
});

// Get all events created by institute
router.get('/institute', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || user.role !== 'institute') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied' 
            });
        }

        const events = await Event.find({ instituteId: req.user.userId })
            .populate('registeredStudents', 'fullname email studentId')
            .sort({ createdAt: -1 });

        res.json({ 
            success: true, 
            count: events.length,
            events 
        });
    } catch (error) {
        console.error('Get institute events error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to fetch events'
        });
    }
});

// Get all active events (for students)
router.get('/active', auth, async (req, res) => {
    try {
        const today = new Date();
        const events = await Event.find({ 
            status: 'Active',
            deadline: { $gte: today }
        })
            .populate('instituteId', 'instituteName instituteType city state')
            .sort({ eventDate: 1 });

        res.json({ 
            success: true, 
            count: events.length,
            events 
        });
    } catch (error) {
        console.error('Get active events error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to fetch events'
        });
    }
});

// Get event by ID with full details
router.get('/:id', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('instituteId', 'instituteName instituteType email phone city state website')
            .populate('registeredStudents', 'fullname email studentId university major phone');

        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }

        res.json({ 
            success: true, 
            event 
        });
    } catch (error) {
        console.error('Get event details error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to fetch event details'
        });
    }
});

// Update event status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['Active', 'Ended', 'Cancelled'].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid status' 
            });
        }

        const event = await Event.findOneAndUpdate(
            { _id: req.params.id, instituteId: req.user.userId },
            { status },
            { new: true }
        );

        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found or unauthorized' 
            });
        }

        res.json({ 
            success: true, 
            message: `Event status updated to ${status}`,
            event 
        });
    } catch (error) {
        console.error('Update event status error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to update event status'
        });
    }
});

// Update event details
router.put('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || user.role !== 'institute') {
            return res.status(403).json({ 
                success: false, 
                message: 'Only institutes can update events' 
            });
        }

        const event = await Event.findOneAndUpdate(
            { _id: req.params.id, instituteId: req.user.userId },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found or unauthorized' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Event updated successfully',
            event 
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to update event'
        });
    }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || user.role !== 'institute') {
            return res.status(403).json({ 
                success: false, 
                message: 'Only institutes can delete events' 
            });
        }

        const event = await Event.findOneAndDelete({
            _id: req.params.id,
            instituteId: req.user.userId
        });

        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found or unauthorized' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to delete event'
        });
    }
});

// Register student for event
router.post('/:id/register', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || user.role !== 'student') {
            return res.status(403).json({ 
                success: false, 
                message: 'Only students can register for events' 
            });
        }

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }

        // Check if event is active
        if (event.status !== 'Active') {
            return res.status(400).json({ 
                success: false, 
                message: 'Event is not accepting registrations' 
            });
        }

        // Check deadline
        if (new Date() > event.deadline) {
            return res.status(400).json({ 
                success: false, 
                message: 'Registration deadline has passed' 
            });
        }

        // Check capacity
        if (event.registeredStudents.length >= event.capacity) {
            return res.status(400).json({ 
                success: false, 
                message: 'Event has reached maximum capacity' 
            });
        }

        // Check if already registered
        if (event.registeredStudents.includes(req.user.userId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'You are already registered for this event' 
            });
        }

        event.registeredStudents.push(req.user.userId);
        await event.save();

        res.json({ 
            success: true, 
            message: 'Successfully registered for event',
            event 
        });
    } catch (error) {
        console.error('Register for event error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to register for event'
        });
    }
});

// Unregister from event
router.post('/:id/unregister', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || user.role !== 'student') {
            return res.status(403).json({ 
                success: false, 
                message: 'Only students can unregister from events' 
            });
        }

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }

        // Check if registered
        if (!event.registeredStudents.includes(req.user.userId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'You are not registered for this event' 
            });
        }

        event.registeredStudents = event.registeredStudents.filter(
            id => id.toString() !== req.user.userId
        );
        await event.save();

        res.json({ 
            success: true, 
            message: 'Successfully unregistered from event'
        });
    } catch (error) {
        console.error('Unregister from event error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to unregister from event'
        });
    }
});

// Get registered students for an event (Institute only)
router.get('/:id/students', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || user.role !== 'institute') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied' 
            });
        }

        const event = await Event.findOne({
            _id: req.params.id,
            instituteId: req.user.userId
        }).populate('registeredStudents', 'fullname email studentId university major phone');

        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found or unauthorized' 
            });
        }

        res.json({ 
            success: true, 
            eventName: event.eventName,
            totalStudents: event.registeredStudents.length,
            students: event.registeredStudents 
        });
    } catch (error) {
        console.error('Get registered students error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to fetch registered students'
        });
    }
});

// Get event statistics (Institute only)
router.get('/:id/stats', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || user.role !== 'institute') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied' 
            });
        }

        const event = await Event.findOne({
            _id: req.params.id,
            instituteId: req.user.userId
        }).populate('registeredStudents', 'university major');

        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found or unauthorized' 
            });
        }

        // Calculate statistics
        const totalRegistrations = event.registeredStudents.length;
        const capacityUsed = ((totalRegistrations / event.capacity) * 100).toFixed(2);
        const totalRevenue = totalRegistrations * event.fees;

        // University distribution
        const universityDistribution = {};
        event.registeredStudents.forEach(student => {
            universityDistribution[student.university] = 
                (universityDistribution[student.university] || 0) + 1;
        });

        // Major distribution
        const majorDistribution = {};
        event.registeredStudents.forEach(student => {
            majorDistribution[student.major] = 
                (majorDistribution[student.major] || 0) + 1;
        });

        res.json({ 
            success: true, 
            statistics: {
                eventName: event.eventName,
                totalRegistrations,
                capacity: event.capacity,
                capacityUsed: `${capacityUsed}%`,
                availableSlots: event.capacity - totalRegistrations,
                totalRevenue: `₹${totalRevenue}`,
                status: event.status,
                universityDistribution,
                majorDistribution
            }
        });
    } catch (error) {
        console.error('Get event stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to fetch event statistics'
        });
    }
});

module.exports = router;