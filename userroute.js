const express= require("express")
const user_route= express()

const session= require("express-session")
const config=require("../config/config")
user_route.use(session({secret:config.sessionSecret}))

const authen = require('../middleware/auth')
const jwtoken = require('jsonwebtoken');
const jwt = require("../middleware/jAuth")

const userController= require("../controller/userController")

user_route.set("views",'./view/user')
user_route.use(express.static("C:/project1/view/user"))

Product= require("../model/productModel")
User=require("../model/userModel")

const bodyParser=require("body-parser")
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))



user_route.get('/',userController.loadHome)

user_route.get('/signup',userController.signUpLoad)

user_route.get('/login',userController.loginLoad)

user_route.post('/signup',userController.newUser)

user_route.get('/forgot',userController.forgotPass)

user_route.post('/forgot',userController.sendingOTP)

user_route.post('/checkOTP',userController.OTPchecking)

user_route.post('/setPassword',userController.resetPassword)

user_route.post('/login',userController.verifyLogin)

user_route.get('/logout',userController.logout)

user_route.get('/loadOTP',userController.otpLoad)

user_route.get('/get',userController.getOtp)

user_route.post('/otpverify',userController.OTPcheck)

user_route.get('/viewPro',userController.viewProduct)

user_route.get('/addToCart',userController.cartAdd)

user_route.post('/updateQuantity',userController.cartUpdateQuantity) /// to update quantity

user_route.get('/loadCart',userController.cartLoad)

user_route.get('/deleteCart',userController.cartDelete)

user_route.get('/checkout',userController.checkout)

user_route.get('/profile',userController.loadProfile)

user_route.post('/editProfile',userController.editProfile)

user_route.get('/toAddress',userController.loadAddress)

user_route.post('/addAddress',userController.addAddress)

user_route.get('/deleteAddress',userController.deleteAddress)

user_route.get('/loadEdit',userController.addressEdit)

user_route.post('/editAddress',userController.editAddress)

user_route.post('/loadChange',userController.passwordCheck)

user_route.post('/changePassword',userController.passwordChange)

user_route.get('/lowToHigh',userController.priceLTH)

user_route.get('/highTolow',userController.priceHTL)

user_route.get('/latest',userController.latest)

user_route.get('/AtoZ',userController.AtoZ)

user_route.get('/ZtoA',userController.ZtoA)

user_route.get('/inStock',userController.inStock)

user_route.post('/search',userController.search)

user_route.post('/orderPlaced',userController.ordered)

user_route.get('/orders',userController.loadOrders)

user_route.get('/details',userController.loadDetails)






// sign in with google

// const express= require("express")

// const session = require('express-session')

const passport = require("passport")

const auth = require('../authapi2')
const { find, findById } = require("../model/userModel")

function isLoggedIn(req,res,next){
    req.user ? next() : res.sendStatus(401)
    // req.session.user_id=req.user.id;
}

// const user_route = express()

user_route.use(session({secret : "cats" }))
user_route.use(passport.initialize())
user_route.use(passport.session())

user_route.get('/',(req,res)=>{
    res.send('<a href="/user/auth/google">Authenticate with Google</a>')
})

user_route.get('/auth/google',
passport.authenticate('google',{ scope:['email' , 'profile']})
)

user_route.get('/google/callback',
  passport.authenticate('google',{
    successRedirect:'/user/protected',
    failureRedirect:'/user/auth/failure',
  })
)

user_route.get('/auth/failure',(req,res)=>{
    res.send('something went wrong..')
})

user_route.get('/protected',isLoggedIn,async (req,res)=>{
    // res.send(`Hello ${req.user.displayName}`);
    
    
    try{
        const products = await Product.find()
        res.render('home',{product:products})
        // console.log(req.user);
        
        
        const user = new User({
            name: req.user.given_name,
            email: req.user.email,
            mobile: "1234567890",
            password: "123",
        });

        const userD = await user.save();
        const userData = await find()
        req.session.user_id=userData._id;
    }catch(error){
        console.log(error.message);
    }
})

user_route.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            console.error(err);
            return res.sendStatus(500); // Internal Server Error
        }
        req.session.destroy();
        res.redirect('/user/login');
    });
});


module.exports=user_route