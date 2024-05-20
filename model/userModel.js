const mongoose=require("mongoose")


const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
        
    },
    mobile:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    },
    status:{
        type:String,
        default:"NotBlocked"
    },
   
    verified:{
        type:String,
        default:"0"
    },
    coupons:[{
        code:{
            type:String,
            required:true
        },
        applied:{
            type:Boolean,
            default:false
        }
    }]
})

module.exports=mongoose.model('users',userSchema)