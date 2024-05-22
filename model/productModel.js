const mongoose=require("mongoose")


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },

    image: [{
        type: String,
        required: true
    }],
    date: {
        type: Date,
        default: Date.now
    },
    color: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    status:{
        type:String,
        default:"listed"
    },
    category:{
       name: {
        type:String,
        required:true
        },
        status:{
            type:String,
            default:"listed"
        }
    },
    offer:{
        
            type:Boolean,
            default:false
        
    },
    offerPercentage:{
        type:String,
        defalut:"nil"
    },
    originalPrice:{
        type:Number,
        required : true
    },
    count:{
        type:Number,
        default:0
    },
    
})

module.exports=mongoose.model('products',productSchema)