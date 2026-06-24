const { ObjectId } = require("mongodb")
const mongoose=require("mongoose")

const couponSchema = new mongoose.Schema({
    // userId:{
    //     type:String,
    //     required:true
    // },
    name:{
        type: String,
        required: true  
    },
    amount:{
            type:Number,
            required: true
    },
    code:{
        type:String,
        required:true,
        unique : true
    },
    expiry: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
    
});


module.exports = mongoose.model('coupons',couponSchema)