const mongoose = require('mongoose');

//Page Schema
const ProductSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
    }
});

const Product = mongoose.model('Product', ProductSchema, 'products');

module.exports = Product;
