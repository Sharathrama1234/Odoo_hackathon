const express = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
};

// Multer configuration for this route
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (PNG, JPEG, JPG, GIF, WebP) are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// Product listing page (home)
router.get('/', requireAuth, async (req, res) => {
    try {
        const { search, category, sort } = req.query;
        let query = { status: 'available' };
        let sortOption = { createdAt: -1 };

        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }

        // Category filter
        if (category && category !== 'all') {
            query.category = category;
        }

        // Sort options
        if (sort === 'price_low') {
            sortOption = { price: 1 };
        } else if (sort === 'price_high') {
            sortOption = { price: -1 };
        } else if (sort === 'newest') {
            sortOption = { createdAt: -1 };
        } else if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        }

        const products = await Product.find(query)
            .populate('seller', 'username')
            .sort(sortOption)
            .limit(50);

        const categories = [
            'Electronics', 'Clothing', 'Furniture', 'Books', 
            'Sports', 'Toys', 'Home & Garden', 'Automotive', 
            'Beauty', 'Other'
        ];

        res.render('products/index', {
            title: 'Products - EcoFinds',
            products,
            categories,
            currentCategory: category || 'all',
            currentSearch: search || '',
            currentSort: sort || 'newest'
        });
    } catch (error) {
        console.error('Products fetch error:', error);
        req.flash('error', 'Error loading products');
        res.render('products/index', {
            title: 'Products - EcoFinds',
            products: [],
            categories: [],
            currentCategory: 'all',
            currentSearch: '',
            currentSort: 'newest'
        });
    }
});

// Add new product page
router.get('/new', requireAuth, (req, res) => {
    const categories = [
        'Electronics', 'Clothing', 'Furniture', 'Books', 
        'Sports', 'Toys', 'Home & Garden', 'Automotive', 
        'Beauty', 'Other'
    ];

    res.render('products/new', {
        title: 'Add New Product - EcoFinds',
        categories
    });
});

// Create new product
router.post('/', requireAuth, upload.array('images', 5), async (req, res) => {
    try {
        const { title, description, category, price, condition } = req.body;

        if (!title || !description || !category || !price) {
            // Delete uploaded files if validation fails
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                });
            }
            req.flash('error', 'All fields are required');
            return res.redirect('/products/new');
        }

        // Handle uploaded images
        let imagePaths = ['/images/placeholder-product.jpg']; // Default
        if (req.files && req.files.length > 0) {
            imagePaths = req.files.map(file => `/uploads/${file.filename}`);
        }

        const product = new Product({
            title,
            description,
            category,
            price: parseFloat(price),
            condition: condition || 'Good',
            seller: req.session.user._id,
            images: imagePaths
        });

        await product.save();
        req.flash('success', 'Product listed successfully!');
        res.redirect('/products/my/listings');
    } catch (error) {
        console.error('Product creation error:', error);
        
        // Delete uploaded files if save fails
        if (req.files) {
            req.files.forEach(file => {
                fs.unlink(file.path, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            });
        }
        
        req.flash('error', 'Error creating product listing');
        res.redirect('/products/new');
    }
});

// My listings page (must come before /:id route)
router.get('/my/listings', requireAuth, async (req, res) => {
    try {
        const products = await Product.find({ seller: req.session.user._id })
            .sort({ createdAt: -1 });

        res.render('products/my-listings', {
            title: 'My Listings - EcoFinds',
            products
        });
    } catch (error) {
        console.error('My listings error:', error);
        req.flash('error', 'Error loading your listings');
        res.render('products/my-listings', {
            title: 'My Listings - EcoFinds',
            products: []
        });
    }
});

// Product detail page
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'username email phone');

        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('/products');
        }

        // Increment view count
        product.views += 1;
        await product.save();

        // Check if product is in user's cart
        const user = await User.findById(req.session.user._id);
        const isInCart = user.cart.some(item => 
            item.product.toString() === product._id.toString()
        );

        res.render('products/detail', {
            title: `${product.title} - EcoFinds`,
            product,
            isInCart,
            isOwner: product.seller._id.toString() === req.session.user._id
        });
    } catch (error) {
        console.error('Product detail error:', error);
        req.flash('error', 'Error loading product details');
        res.redirect('/products');
    }
});

// Edit product page
router.get('/:id/edit', requireAuth, async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            seller: req.session.user._id
        });

        if (!product) {
            req.flash('error', 'Product not found or you are not authorized to edit it');
            return res.redirect('/products/my/listings');
        }

        const categories = [
            'Electronics', 'Clothing', 'Furniture', 'Books', 
            'Sports', 'Toys', 'Home & Garden', 'Automotive', 
            'Beauty', 'Other'
        ];

        res.render('products/edit', {
            title: 'Edit Product - EcoFinds',
            product,
            categories
        });
    } catch (error) {
        console.error('Edit product page error:', error);
        req.flash('error', 'Error loading product for editing');
        res.redirect('/products/my/listings');
    }
});

// Update product
router.put('/:id', requireAuth, upload.array('images', 5), async (req, res) => {
    try {
        const { title, description, category, price, condition, keepExistingImages } = req.body;

        // Find the current product to get existing images
        const currentProduct = await Product.findOne({
            _id: req.params.id,
            seller: req.session.user._id
        });

        if (!currentProduct) {
            // Delete uploaded files if product not found
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                });
            }
            req.flash('error', 'Product not found or you are not authorized to edit it');
            return res.redirect('/products/my/listings');
        }

        // Handle images
        let imagePaths = currentProduct.images;
        
        // If new images are uploaded, replace existing ones
        if (req.files && req.files.length > 0) {
            // Delete old images (except placeholder)
            currentProduct.images.forEach(imagePath => {
                if (imagePath !== '/images/placeholder-product.jpg' && imagePath.startsWith('/uploads/')) {
                    const fullPath = path.join(__dirname, '..', 'public', imagePath);
                    fs.unlink(fullPath, (err) => {
                        if (err) console.error('Error deleting old image:', err);
                    });
                }
            });
            
            // Set new images
            imagePaths = req.files.map(file => `/uploads/${file.filename}`);
        }

        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, seller: req.session.user._id },
            {
                title,
                description,
                category,
                price: parseFloat(price),
                condition,
                images: imagePaths
            },
            { new: true }
        );

        req.flash('success', 'Product updated successfully!');
        res.redirect('/products/my/listings');
    } catch (error) {
        console.error('Product update error:', error);
        
        // Delete uploaded files if save fails
        if (req.files) {
            req.files.forEach(file => {
                fs.unlink(file.path, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            });
        }
        
        req.flash('error', 'Error updating product');
        res.redirect('/products/my/listings');
    }
});

// Delete product
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            seller: req.session.user._id
        });

        if (!product) {
            req.flash('error', 'Product not found or you are not authorized to delete it');
            return res.redirect('/products/my/listings');
        }

        req.flash('success', 'Product deleted successfully!');
        res.redirect('/products/my/listings');
    } catch (error) {
        console.error('Product delete error:', error);
        req.flash('error', 'Error deleting product');
        res.redirect('/products/my/listings');
    }
});

// Add to cart
router.post('/:id/cart', requireAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('/products');
        }

        if (product.seller.toString() === req.session.user._id) {
            req.flash('error', 'You cannot add your own product to cart');
            return res.redirect(`/products/${product._id}`);
        }

        const user = await User.findById(req.session.user._id);
        
        // Check if product is already in cart
        const existingItem = user.cart.find(item => 
            item.product.toString() === product._id.toString()
        );

        if (existingItem) {
            req.flash('error', 'Product is already in your cart');
        } else {
            user.cart.push({ product: product._id });
            await user.save();
            req.flash('success', 'Product added to cart!');
        }

        res.redirect(`/products/${product._id}`);
    } catch (error) {
        console.error('Add to cart error:', error);
        req.flash('error', 'Error adding product to cart');
        res.redirect('/products');
    }
});

module.exports = router;
