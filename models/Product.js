const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Electronics',
            'Clothing',
            'Furniture',
            'Books',
            'Sports',
            'Toys',
            'Home & Garden',
            'Automotive',
            'Beauty',
            'Other'
        ]
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    condition: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Poor'],
        default: 'Good'
    },
    images: [{
        type: String,
        default: function() {
            return ['/images/placeholder-product.jpg'];
        }
    }],
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'sold', 'reserved'],
        default: 'available'
    },
    views: {
        type: Number,
        default: 0
    },
    tags: [String]
}, {
    timestamps: true
});

// Index for search functionality
productSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
