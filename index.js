const express=require("express")
const app = express()


const mongoose= require("mongoose")


require('dotenv').config();

const mongodbURI = process.env.MONGODB_URI; // MongoDB connection URI from .env file

// Connect to MongoDB with authentication
mongoose.connect(mongodbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true 
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const userRoute=require('./routes/userRoute')
const adminRoute=require('./routes/adminRoute')



const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

app.set('view engine','ejs')


const bodyParser=require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

app.use('/user',userRoute)

app.use('/admin',adminRoute)


app.listen(3000,()=>{
    console.log("started");
})