const mongoose = require('mongoose');

//Page Schema
const PageSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    slug: {
        type: String,
    },
    content: {
        type: String,
        require: true
    },
    sorting: {
        type: Number,
    }
});

const Page = mongoose.model('Page', PageSchema, 'pages');

module.exports = Page;
