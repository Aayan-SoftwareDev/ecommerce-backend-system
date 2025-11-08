const {newProduct} = require("../models/new_product");
require('dotenv').config();

const auth_key = process.env.auth_key;

async function controllerAddProduct(req, res){
    const body = req.body;
    if(!body.auth) res.status(401);
    else if(!body.auth == auth_key) res.status(401);
    else if(!body.name || !body.price || !body.image_url) res.status(400);
    else {
        const product = await newProduct.insertOne({
            name: body.name,
            image_url: body.image_url,
            price: String(body.price),
        });
        res.status(200).end('<h1>Product Added</h1>');
    }
}

async function controllerGetAllProducts(req, res){
    let products = await newProduct.find({});
    res.status(200).json(products);
}

async function controllerDelProduct(req, res){
    const body = req.body;
    if(!body.id) res.status(400).end("please enter id");
    const delProduct = await newProduct.deleteOne({_id: body.id})
    res.json(delProduct);
}

module.exports = {
    controllerAddProduct,
    controllerGetAllProducts,
    controllerDelProduct,
};
