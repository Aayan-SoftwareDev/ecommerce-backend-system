const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    price: {
        type: String,
        required: true,
    },

    image_url: {
        type: String,
        required: true,
    },
});

const newProduct = mongoose.model('products', schema);

module.exports = {
    newProduct,
};