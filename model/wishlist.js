const { ObjectId } = require("mongodb")
const mongoose=require("mongoose")

const wishSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true  
    },
    products:[{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    }]
});


module.exports = mongoose.model('wishlist',wishSchema)