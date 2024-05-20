const mongoose=require("mongoose")




const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (value) {
                // Use a regular expression to check for white spaces
                return !/\s/.test(value);
            }
           
        }
    },
    description: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                // Use a regular expression to check for white spaces
                return !/\s/.test(value);
            }
            
        }
    },
    date: {
        type: Date,
        default: Date.now
    },
    status:{
        type:String,
        default:"Active"
    },
    offer:{
        type:Boolean,
        default:false
    },
    count:{
        type:Number,
        default:0
    }
});

module.exports=mongoose.model('category',Schema)