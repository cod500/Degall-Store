const mongoose = require('mongoose');

//Category schema
const CategorySchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    slug: {
        type: String,
    }
});

const Category = mongoose.model('Category', CategorySchema, 'categories');

module.exports = Category;