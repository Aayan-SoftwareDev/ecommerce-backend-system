const mongoose = require("mongoose");

async function mongoConnect(url){
    mongoose.connect(url);
}

module.exports = {
    mongoConnect,
};