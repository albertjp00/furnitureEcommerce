const { ObjectId } = require("mongodb")
const mongoose=require("mongoose")

const couponSchema = new mongoose.Schema({
    offer:{
        type:String,
        required:true
    },
    category:{
        type: String,
        required: true  
    },
});


module.exports = mongoose.model('offer',couponSchema)