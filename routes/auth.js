const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/products');
    }
    next();
};

// Middleware to check if user is not authenticated
const requireGuest = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
};

// Login page
router.get('/login', requireAuth, (req, res) => {
    res.render('auth/login', {
        title: 'Login - EcoFinds',
        error: req.flash('error')
    });
});

// Register page
router.get('/register', requireAuth, (req, res) => {
    res.render('auth/register', {
        title: 'Register - EcoFinds',
        error: req.flash('error')
    });
});

// Login POST
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            req.flash('error', 'Please provide email and password');
            return res.redirect('/auth/login');
        }

        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'You don\'t have an account. Please register first.');
            return res.redirect('/auth/login');
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            req.flash('error', 'Invalid password. Please check your password and try again.');
            return res.redirect('/auth/login');
        }

        req.session.user = {
            _id: user._id,
            username: user.username,
            email: user.email
        };

        res.redirect('/products');
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'An error occurred during login');
        res.redirect('/auth/login');
    }
});

// Register POST
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        if (!username || !email || !password || !confirmPassword) {
            req.flash('error', 'All fields are required');
            return res.redirect('/auth/register');
        }

        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match');
            return res.redirect('/auth/register');
        }

        if (password.length < 6) {
            req.flash('error', 'Password must be at least 6 characters long');
            return res.redirect('/auth/register');
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            req.flash('error', 'User with this email or username already exists');
            return res.redirect('/auth/register');
        }

        // Create new user
        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        req.session.user = {
            _id: user._id,
            username: user.username,
            email: user.email
        };

        res.redirect('/products');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'An error occurred during registration');
        res.redirect('/auth/register');
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/auth/login');
    });
});

module.exports = router;
