const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Common fields for all users
    fullname: {
        type: String,
        required: function() { return this.role === 'student'; },
        trim: true,
        minlength: [2, 'Full name must be at least 2 characters']
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'Username must be at least 3 characters'],
        match: [/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        enum: ['student', 'institute', 'admin'],
        required: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    termsAccepted: {
        type: Boolean,
        required: [true, 'You must accept the terms and conditions'],
        validate: {
            validator: function(value) {
                return value === true;
            },
            message: 'You must accept the terms and conditions'
        }
    },

    // Student-specific fields
    studentId: {
        type: String,
        required: function() { return this.role === 'student'; },
        trim: true
    },
    major: {
        type: String,
        required: function() { return this.role === 'student'; },
        trim: true
    },
    university: {
        type: String,
        required: function() { return this.role === 'student'; },
        trim: true
    },

    // Institute-specific fields
    instituteName: {
        type: String,
        required: function() { return this.role === 'institute'; },
        trim: true
    },
    instituteType: {
        type: String,
        required: function() { return this.role === 'institute'; },
        enum: ['university', 'college', 'technical', 'management', 'engineering', 'medical', 'other']
    },
    address: {
        type: String,
        required: function() { return this.role === 'institute'; }
    },
    city: {
        type: String,
        required: function() { return this.role === 'institute'; }
    },
    state: {
        type: String,
        required: function() { return this.role === 'institute'; }
    },
    pincode: {
        type: String,
        required: function() { return this.role === 'institute'; }
    },
    country: {
        type: String,
        default: 'India',
        required: function() { return this.role === 'institute'; }
    },
    establishedYear: {
        type: Number,
        required: function() { return this.role === 'institute'; }
    },
    affiliatedTo: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    contactPersonName: {
        type: String,
        required: function() { return this.role === 'institute'; }
    },
    designation: {
        type: String,
        required: function() { return this.role === 'institute'; }
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);