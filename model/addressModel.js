const mongoose=require("mongoose")


const addressSchema=new mongoose.Schema({
    userId:{
        type:String,
    },
    houseAddress: {
            type:String, 
            required:false
        },
    place:{
            type:String,
        },
    pincode:{
            type:String
        },
    country: {
            type: String,
            required:false
        },
    
    
    
})

module.exports=mongoose.model('address',addressSchema)