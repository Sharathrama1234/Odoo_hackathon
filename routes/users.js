const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const router = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
};

// User dashboard
router.get('/dashboard', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/auth/login');
        }

        res.render('users/dashboard', {
            title: 'Dashboard - EcoFinds',
            user
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error', 'Error loading dashboard');
        res.redirect('/products');
    }
});

// Update user profile
router.put('/profile', requireAuth, async (req, res) => {
    try {
        const {
            firstName, lastName, phone, 
            street, city, state, zipCode, country
        } = req.body;

        const user = await User.findByIdAndUpdate(
            req.session.user._id,
            {
                firstName,
                lastName,
                phone,
                address: {
                    street,
                    city,
                    state,
                    zipCode,
                    country
                }
            },
            { new: true }
        );

        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/auth/login');
        }

        req.flash('success', 'Profile updated successfully!');
        res.redirect('/users/dashboard');
    } catch (error) {
        console.error('Profile update error:', error);
        req.flash('error', 'Error updating profile');
        res.redirect('/users/dashboard');
    }
});

// Cart page
router.get('/cart', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id)
            .populate({
                path: 'cart.product',
                populate: {
                    path: 'seller',
                    select: 'username'
                }
            });

        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/auth/login');
        }

        // Filter out any null products (in case product was deleted)
        user.cart = user.cart.filter(item => item.product);

        // Calculate total
        const total = user.cart.reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
        }, 0);

        res.render('users/cart', {
            title: 'Cart - EcoFinds',
            cartItems: user.cart,
            total
        });
    } catch (error) {
        console.error('Cart error:', error);
        req.flash('error', 'Error loading cart');
        res.render('users/cart', {
            title: 'Cart - EcoFinds',
            cartItems: [],
            total: 0
        });
    }
});

// Remove from cart
router.delete('/cart/:productId', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/auth/login');
        }

        user.cart = user.cart.filter(item => 
            item.product.toString() !== req.params.productId
        );

        await user.save();
        req.flash('success', 'Product removed from cart');
        res.redirect('/users/cart');
    } catch (error) {
        console.error('Remove from cart error:', error);
        req.flash('error', 'Error removing product from cart');
        res.redirect('/users/cart');
    }
});

// Update cart quantity
router.put('/cart/:productId', requireAuth, async (req, res) => {
    try {
        const { quantity } = req.body;
        const user = await User.findById(req.session.user._id);
        
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/auth/login');
        }

        const cartItem = user.cart.find(item => 
            item.product.toString() === req.params.productId
        );

        if (cartItem) {
            cartItem.quantity = parseInt(quantity) || 1;
            await user.save();
            req.flash('success', 'Cart updated');
        }

        res.redirect('/users/cart');
    } catch (error) {
        console.error('Update cart error:', error);
        req.flash('error', 'Error updating cart');
        res.redirect('/users/cart');
    }
});

// Purchase items (simplified)
router.post('/purchase', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id)
            .populate('cart.product');

        if (!user || user.cart.length === 0) {
            req.flash('error', 'Cart is empty');
            return res.redirect('/users/cart');
        }

        // Move cart items to purchases
        for (const item of user.cart) {
            user.purchases.push({
                product: item.product._id,
                price: item.product.price,
                purchaseDate: new Date()
            });

            // Mark product as sold
            await Product.findByIdAndUpdate(item.product._id, {
                status: 'sold'
            });
        }

        // Clear cart
        user.cart = [];
        await user.save();

        req.flash('success', 'Purchase completed successfully!');
        res.redirect('/users/purchases');
    } catch (error) {
        console.error('Purchase error:', error);
        req.flash('error', 'Error processing purchase');
        res.redirect('/users/cart');
    }
});

// Previous purchases page
router.get('/purchases', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id)
            .populate({
                path: 'purchases.product',
                populate: {
                    path: 'seller',
                    select: 'username'
                }
            });

        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/auth/login');
        }

        // Filter out any null products and sort by purchase date
        const purchases = user.purchases
            .filter(purchase => purchase.product)
            .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

        res.render('users/purchases', {
            title: 'Previous Purchases - EcoFinds',
            purchases
        });
    } catch (error) {
        console.error('Purchases error:', error);
        req.flash('error', 'Error loading purchases');
        res.render('users/purchases', {
            title: 'Previous Purchases - EcoFinds',
            purchases: []
        });
    }
});

module.exports = router;
