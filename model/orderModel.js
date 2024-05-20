const mongoose = require('mongoose')

    const order =  new mongoose.Schema(
        {
            userId:{
                type:String,
                required: true
                
            },
            products:[{
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true
                },
                quantity: {
                    type: Number,
                    required:true
                },  
                price:{
                    type:String,
                    default:'2'
                },
                status:{
                    type:String,
                    default:"Order Placed"
                },
                cancelReason:{
                    type:String,
                    
                }
                
                
                
            }],
            totalAmount:{
                type:String,
                required:true
            },
            addressId:{
                type:String,
                required:true
            },
            address: {
                houseAddress: {
                    type: String,
                    required: false
                },
                place: {
                    type: String
                },
                pincode: {
                    type: String
                },
                country: {
                    type: String,
                    required: false
                }
            },
            
            paymentmethod:{
                type:String,
                required:true
            },
            coupon:{
                    type:Boolean,
                    default:false
            },
            date:{
                type:Date,
                defalut:Date.now()
            },
            status:{
                type:String,
                default: "Order Placed"
            },
            cancelReason:{  
                type:String,
                default:"nill"
            }

        
        })

    module.exports=mongoose.model('orders',order)