const express = require("express");
const {mongoConnect} = require('./connect');
const {router} = require("./routes/book");
const {router_products} = require("./routes/new_product");
const cors = require('cors');
const app = express();
const port = 8000;


app.use(express.json());
app.use(express.urlencoded({ extended: false })); 
app.use(cors());

mongoConnect("Your_Url_Here")
.then(() => console.log("mongodb connected!"))
.catch(() => console.log("failed to connect with mongodb"));
app.use('/order', router);
app.use('/product', router_products);

app.listen(port, () => console.log(`server started at port ${port}`));

