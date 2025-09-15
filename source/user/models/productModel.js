const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        productId: {type: String, require: true, aparse: true},
        
    }
)