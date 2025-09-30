const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS - Allow everything
app.use(cors());
app.options('*', cors());

// Update CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DEBUG ALL REQUESTS
app.use((req, res, next) => {
    console.log(`🔍 ${req.method} ${req.originalUrl}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('📦 Body:', req.body);
    }
    next();
});

// Database connection (optional for now)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventhub', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log('❌ MongoDB Error:', err.message));

// IMPORT ROUTES
const authRoutes = require('./routes/auth');
const feedbackRoutes = require('./routes/feedback');

// USE ROUTES - MAKE SURE THESE ARE BEFORE ANY OTHER ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);  // Make sure this comes before the 404 handler

// Test if routes are working
app.get('/api/debug-routes', (req, res) => {
    res.json({
        message: 'Debug routes',
        availableRoutes: [
            'GET  /api/feedback/test',
            'POST /api/feedback/submit',
            'POST /api/auth/register/student',
            'POST /api/auth/login'
        ]
    });
});

// Basic route
app.get('/', (req, res) => {
    res.json({ 
        message: 'EventHub API is running!',
        feedbackRoute: 'POST /api/feedback/submit'
    });
});

// 404 handler
app.use('*', (req, res) => {
    console.log('❌ 404 - Route not found:', req.method, req.originalUrl);
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        availableMethods: ['GET', 'POST']
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`📝 Feedback route: POST http://localhost:${PORT}/api/feedback/submit`);
    console.log(`🔧 Debug routes: GET http://localhost:${PORT}/api/debug-routes`);
});