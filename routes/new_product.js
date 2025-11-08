const express = require("express");
const {controllerAddProduct
    , controllerGetAllProducts
    , controllerDelProduct} = require("../controllers/new_product");

const router_products = express.Router();

router_products.get("/", controllerGetAllProducts);

router_products.post("/add", controllerAddProduct);

router_products.post("/remove", controllerDelProduct);

module.exports = {
    router_products,
};