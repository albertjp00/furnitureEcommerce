
const mongoose=require("mongoose")

const cartSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true,
    },
    products:[{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        quantity: {
            type: Number,
            default: "1"
        }
    }],
    totalAmount:{
        type:Number,
        default:0
    },
    coupon:{
        type:Boolean,
        default:false
    },
    couponCode:{
        type:String,
    }
});


// const cartSchema = new mongoose.Schema({
//     userId: {
//         type: String,
//         required: true  
//     },
//     products: [{
//         productId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Product', // Assuming 'Product' is the name of your product model
//             required: true
//         },
//         quantity: {
//             type: Number,
//             default: 1
//         }
//     }]
// });
    


module.exports=mongoose.model('carts',cartSchema)