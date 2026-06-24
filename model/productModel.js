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
    description : {
        type : String,
    },
    offer:{
            type:String,
            default:'nil'
        
    },
    offerType: {
        type: String,
        enum: ["none", "category", "product"],
        default: "none"
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
    createdAt : {
        type : Date,
        default : Date.now()
    },

    
})

module.exports=mongoose.model('products',productSchema)