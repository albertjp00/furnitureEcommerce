const { ObjectId } = require("mongodb")
const mongoose=require("mongoose")

const walletSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true  
    },
    refunds:[{
        productId:{
            type:String,

        },
        amount:{
            type:String,
        }

    }],
    
    totalAmount:{
        type:Number,
        default:0
    }
    
});



module.exports=mongoose.model('wallet',walletSchema)