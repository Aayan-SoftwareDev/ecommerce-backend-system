const { Order } = require("../models/order");
const { newProduct } = require("../models/new_product");
const axios = require("axios");
require('dotenv').config();

const INSTA_API = "neyl1q7qp2hagwbc2mex";

async function controllerBookOrder(req, res) {
  try {
    const body = req.body;
    const InstaUrl = "https://one-be.instaworld.pk/logistics/v1/createShipment";
    
    // ✅ Validate required fields
    if (
      !body.email ||
      !body.address ||
      !body.phone ||
      !body.name ||
      !body.type ||
      !body.city ||
      !body.quantity
    ) {
      return res.status(400).json({ error: "Please send the correct body!" });
    }

    // ✅ Normalize type and quantity to always be arrays
    const productTypes = Array.isArray(body.type) ? body.type : [body.type];
    const quantities = Array.isArray(body.quantity) 
      ? body.quantity.map(q => Number(q)) 
      : [Number(body.quantity)];

    // ✅ Validate array lengths match
    if (productTypes.length !== quantities.length) {
      return res.status(400).json({ 
        error: "Product types and quantities arrays must have the same length" 
      });
    }

    console.log('📥 Received order request:', {
      productTypes,
      quantities,
      city: body.city
    });

    // ✅ Fetch all products from database
    const products = await newProduct.find({ name: { $in: productTypes } });
    
    if (products.length === 0) {
      return res.status(404).json({ error: "Product(s) not found!" });
    }

    // ✅ Create a map for quick product lookup
    const productMap = {};
    products.forEach(p => {
      productMap[p.name] = p;
    });

    // ✅ Calculate total price and build items array
    let totalPrice = 0;
    const items = [];
    const orderDetails = []; // For logging
    
    for (let i = 0; i < productTypes.length; i++) {
      const productName = productTypes[i];
      const product = productMap[productName];
      
      if (!product) {
        return res.status(404).json({ 
          error: `Product "${productName}" not found in database` 
        });
      }
      
      const qty = quantities[i];
      const itemPrice = Number(product.price);
      
      // ✅ Validate price and quantity
      if (!Number.isFinite(itemPrice) || itemPrice <= 0) {
        return res.status(400).json({ 
          error: `Invalid price for product "${productName}"` 
        });
      }
      
      if (!Number.isFinite(qty) || qty <= 0) {
        return res.status(400).json({ 
          error: `Invalid quantity for product "${productName}"` 
        });
      }
      
      const itemTotal = itemPrice * qty;
      totalPrice += itemTotal;
      
      items.push({
        title: productName,
        price: itemPrice,
        quantity: qty,
        kg: 1 * qty, // Assuming 1kg per item
      });
      
      orderDetails.push({
        product: productName,
        quantity: qty,
        unitPrice: itemPrice,
        total: itemTotal
      });
    }

    // ✅ Add shipping cost
    const shipping = 0;
    const finalTotal = totalPrice + shipping;

    console.log('📦 Order Calculation:', {
      items: orderDetails,
      subtotal: totalPrice,
      shipping: shipping,
      total: finalTotal
    });

    // ✅ Insert the order into database - FIXED
    const orderDocument = {
      email: body.email,
      address: body.address,
      phone: body.phone,
      name: body.name,
      type: productTypes.join(', '), // Store as comma-separated string
      quantity: quantities.join(', '), // Store as comma-separated string
      price: finalTotal, // Total including shipping
      city: body.city,
      created_at: new Date()
    };

    const newOrder = await Order.insertOne(orderDocument);
    
    // ✅ Generate reference number safely
    const refNo = newOrder.insertedId 
      ? newOrder.insertedId.toString() 
      : `ORD-${Date.now()}`; // Fallback to timestamp-based ID

    console.log('✅ Order saved to database with ID:', refNo);

    // ✅ Build the data object for Insta API
    const data = {
      ref_no: refNo,
      api_key: INSTA_API,
      consignee_first_name: body.name,
      consignee_email: body.email,
      consignee_phone: body.phone,
      consignee_address: body.address,
      consignee_city: body.city,
      amount: finalTotal,
      financial_status: "cod",
      items: items,
    };

    console.log('📤 Sending to Insta API:', JSON.stringify(data, null, 2));

    // ✅ Make API call to shipping service
    const response = await axios.post(InstaUrl, data, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log("✅ Insta API Success:", response.data);
    
    return res.status(200).json({ 
      success: true, 
      orderId: refNo,
      total: finalTotal,
      message: "Order placed successfully",
      shippingResponse: response.data 
    });
    
  } catch (error) {
    console.error("❌ Error booking order:", error.message);
    console.error("Stack trace:", error.stack);
    
    // ✅ Better error response
    return res.status(500).json({ 
      error: error.message || "Server error",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

module.exports = { controllerBookOrder };