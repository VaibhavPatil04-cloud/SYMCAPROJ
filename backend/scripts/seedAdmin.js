const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventplatform', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin', username: 'admin' });
        
        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Username: admin');
            console.log('You can use your existing password');
            process.exit(0);
        }

        // Create admin user
        const adminUser = new User({
            username: 'admin',
            email: 'admin@eventhub.com',
            password: 'admin123', // This will be hashed automatically by the pre-save hook
            role: 'admin',
            phone: '0000000000',
            termsAccepted: true,
            fullname: 'Admin User'
        });

        await adminUser.save();
        
        console.log('✅ Admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('Please change the password after first login');
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

seedAdmin();
