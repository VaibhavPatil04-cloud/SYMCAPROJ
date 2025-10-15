const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '30d'
    });
};

// Student Registration Route
router.post('/register/student', [
    // Validation rules
    body('fullname').trim().notEmpty().withMessage('Full name is required'),
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('studentId').trim().notEmpty().withMessage('Student ID is required'),
    body('major').trim().notEmpty().withMessage('Major is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('university').trim().notEmpty().withMessage('University is required')
], async (req, res) => {
    try {
        console.log('Student registration request received:', req.body);

        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        // Check if email or username exists
        const existingUser = await User.findOne({
            $or: [
                { email: req.body.email },
                { username: req.body.username }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === req.body.email ? 
                    'Email already exists' : 
                    'Username already taken'
            });
        }

        // Create new user
        const user = new User({
            fullname: req.body.fullname,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            studentId: req.body.studentId,
            major: req.body.major,
            phone: req.body.phone,
            university: req.body.university,
            role: 'student',
            termsAccepted: true
        });

        await user.save();
        console.log('Student registered successfully:', user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            userId: user._id
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Registration failed'
        });
    }
});

// Institute Registration
router.post('/register-institute', [
    // Validation rules for institute
    body('instituteName')
        .notEmpty().withMessage('Institute name is required')
        .isLength({ min: 2 }).withMessage('Institute name must be at least 2 characters'),
    
    body('instituteType')
        .isIn(['university', 'college', 'technical', 'management', 'engineering', 'medical', 'other'])
        .withMessage('Valid institute type is required'),
    
    body('email')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    
    body('phone')
        .notEmpty().withMessage('Phone number is required')
        .isMobilePhone().withMessage('Valid phone number is required'),
    
    body('address')
        .notEmpty().withMessage('Address is required'),
    
    body('city')
        .notEmpty().withMessage('City is required'),
    
    body('state')
        .notEmpty().withMessage('State is required'),
    
    body('pincode')
        .notEmpty().withMessage('PIN code is required'),
    
    body('establishedYear')
        .isInt({ min: 1800, max: new Date().getFullYear() })
        .withMessage('Valid established year is required'),
    
    body('contactPersonName')
        .notEmpty().withMessage('Contact person name is required'),
    
    body('designation')
        .notEmpty().withMessage('Designation is required'),
    
    body('terms')
        .isBoolean().withMessage('Terms must be a boolean')
        .custom((value) => value === true).withMessage('You must accept the terms and conditions')

], async (req, res) => {
    try {
        console.log('Institute registration request received:', req.body);

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            instituteName,
            instituteType,
            email,
            password,
            phone,
            address,
            city,
            state,
            pincode,
            country = 'India',
            establishedYear,
            affiliatedTo,
            website,
            contactPersonName,
            designation,
            terms
        } = req.body;

        console.log('Processing institute registration for:', instituteName, email);

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() }, 
                { instituteName: instituteName.trim() }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Institute already exists with this email or name'
            });
        }

        // Create username from institute name
        const username = instituteName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '') + Math.floor(1000 + Math.random() * 9000);

        // Create new institute user
        const user = new User({
            username: username,
            email: email.toLowerCase().trim(),
            password: password,
            phone: phone.trim(),
            role: 'institute',
            termsAccepted: terms,
            
            // Institute-specific fields
            instituteName: instituteName.trim(),
            instituteType: instituteType,
            address: address.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
            country: country.trim(),
            establishedYear: establishedYear,
            affiliatedTo: affiliatedTo ? affiliatedTo.trim() : '',
            website: website ? website.trim() : '',
            contactPersonName: contactPersonName.trim(),
            designation: designation.trim()
        });

        await user.save();
        console.log('Institute saved successfully:', user.instituteName);

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Institute registration successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                instituteName: user.instituteName,
                instituteType: user.instituteType,
                contactPersonName: user.contactPersonName,
                designation: user.designation
            }
        });

    } catch (error) {
        console.error('Institute registration error:', error);
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                success: false,
                message: `This ${field} is already registered`
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during institute registration: ' + error.message
        });
    }
});

// Student Login (existing code)
router.post('/login', [
    body('identifier')
        .notEmpty().withMessage('Username or email is required'),
    
    body('password')
        .notEmpty().withMessage('Password is required')

], async (req, res) => {
    try {
        console.log('Login attempt:', req.body.identifier);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { identifier, password } = req.body;

        // Find user by email or username
        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { username: identifier.toLowerCase() }
            ],
            role: 'student'
        });

        if (!user) {
            console.log('Student not found:', identifier);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials - student not found'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            console.log('Invalid password for student:', identifier);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials - wrong password'
            });
        }

        // Generate token
        const token = generateToken(user._id);
        console.log('Login successful for student:', user.username);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                role: user.role,
                studentId: user.studentId,
                major: user.major,
                university: user.university
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login: ' + error.message
        });
    }
});

// Institute Login
router.post('/login-institute', [
    body('identifier')
        .notEmpty().withMessage('Username or email is required'),
    
    body('password')
        .notEmpty().withMessage('Password is required')

], async (req, res) => {
    try {
        console.log('Institute login attempt:', req.body.identifier);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { identifier, password } = req.body;

        // Find institute user by email or username
        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { username: identifier.toLowerCase() }
            ],
            role: 'institute'
        });

        if (!user) {
            console.log('Institute not found:', identifier);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials - institute not found'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            console.log('Invalid password for institute:', identifier);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials - wrong password'
            });
        }

        // Generate token
        const token = generateToken(user._id);
        console.log('Login successful for institute:', user.instituteName);

        res.json({
            success: true,
            message: 'Institute login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                instituteName: user.instituteName,
                instituteType: user.instituteType,
                contactPersonName: user.contactPersonName,
                designation: user.designation
            }
        });

    } catch (error) {
        console.error('Institute login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during institute login: ' + error.message
        });
    }
});

// Admin Login Route
router.post('/login-admin', [
    body('username')
        .notEmpty().withMessage('Username is required'),
    
    body('password')
        .notEmpty().withMessage('Password is required')

], async (req, res) => {
    try {
        console.log('Admin login attempt:', req.body.username);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { username, password } = req.body;

        // Find admin user by username
        const user = await User.findOne({
            username: username.toLowerCase(),
            role: 'admin'
        });

        if (!user) {
            console.log('Admin not found:', username);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials - admin not found'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            console.log('Invalid password for admin:', username);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials - wrong password'
            });
        }

        // Generate token with role included
        const token = jwt.sign(
            { userId: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '30d' }
        );
        
        console.log('Login successful for admin:', user.username);

        res.json({
            success: true,
            message: 'Admin login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during admin login: ' + error.message
        });
    }
});

// Get current user (works for both student and institute)
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Test route
router.post('/test', (req, res) => {
    console.log('Test route hit:', req.body);
    res.json({
        success: true,
        message: 'Test successful!',
        data: req.body
    });
});

module.exports = router;