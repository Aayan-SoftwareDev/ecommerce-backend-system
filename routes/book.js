const express = require("express");
const {controllerBookOrder} = require("../controllers/book");

const router = express.Router();

router.post('/book', controllerBookOrder);

module.exports = {
    router,
};