const express= require("express")
const user_route= express()

const session=require("express-session")
const config=require("../config/config")
user_route.use(session({
    secret:'secret-key',
    resave: false,
    saveUninitialized: false
}));

const cookieParser = require('cookie-parser');
user_route.use(cookieParser());
const secretKey = process.env.JWT_SECRET || 'your_secret_key';

const authen = require('../middleware/auth')
const jwtoken = require('jsonwebtoken');
const jwt = require("jsonwebtoken")

const path = require("path")


const userController= require("../controller/userController")

user_route.set("views",'./view/user')



// user_route.use(express.static(""))

const staticFilesDirectory = path.join(__dirname, '..', 'view', 'user');
user_route.use(express.static(staticFilesDirectory));

const staticFilesDirectory2 = path.join(__dirname, '..', 'view', 'admin');
user_route.use(express.static(staticFilesDirectory2));


// user_route.use(express.static("C:/ecommerce/view/user"))
// user_route.use(express.static("C:/ecommerce/view/admin"))

const Product= require("../model/productModel")
const User=require("../model/userModel")
const Category = require("../model/categoryModel")
const Cart = require("../model/cartModel")
const Wishlist = require("../model/wishlist")


const bodyParser=require("body-parser")
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))




user_route.get('/',userController.loadHome)

user_route.get('/',authen.islogout,userController.loginLoad)
user_route.get('/login',authen.islogout,userController.loginLoad)

user_route.get('/signup',userController.signUpLoad)

user_route.get('/home',userController.loadHome)
// ,authen.islogin

user_route.post('/login',userController.verifyLogin)



user_route.post('/signup',userController.newUser)

user_route.get('/forgot',userController.forgotPass)

user_route.post('/forgot',userController.sendingOTP)

user_route.post('/checkOTP',userController.OTPchecking)

user_route.post('/setPassword',userController.resetPassword)



user_route.get('/logout',userController.logout)

user_route.get('/loadOTP',userController.otpLoad)

user_route.get('/get',userController.getOtp)

user_route.post('/otpverify',userController.OTPcheck)



user_route.get('/viewPro',userController.viewProduct)

user_route.get('/addToCart',authen.islogin,userController.cartAdd)

user_route.post('/updateQuantity',userController.cartUpdateQuantity) /// to update quantity

user_route.get('/loadCart',authen.islogin,authen.islogin,userController.cartLoad)

user_route.get('/deleteCart',authen.islogin,userController.cartDelete)

user_route.get('/checkout',authen.islogin,userController.checkout)

user_route.get('/loadAddressCheckout',authen.islogin,userController.loadAddressCheckout)

user_route.post('/addAddressCheckout',authen.islogin,userController.addAddressCheckout)






user_route.get('/profile',authen.islogin,userController.loadProfile)

user_route.post('/editProfile',userController.editProfile)

user_route.get('/toAddress',authen.islogin,userController.loadAddress)

user_route.post('/addAddress',userController.addAddress)

user_route.get('/deleteAddress',authen.islogin,userController.deleteAddress)

user_route.get('/loadEdit',authen.islogin,userController.addressEdit)

user_route.post('/editAddress',userController.editAddress)

user_route.post('/loadChange',userController.passwordCheck)

user_route.post('/changePassword',userController.passwordChange)






user_route.get('/lowToHigh',authen.islogin,userController.priceLTH)

user_route.get('/highTolow',authen.islogin,userController.priceHTL)

user_route.get('/latest',authen.islogin,userController.latest)

user_route.get('/AtoZ',authen.islogin,userController.AtoZ)

user_route.get('/ZtoA',authen.islogin,userController.ZtoA)

user_route.get('/inStock',authen.islogin,userController.inStock)

user_route.get('/category',authen.islogin,userController.categoryFilter)

user_route.post('/search',userController.search)




user_route.post('/orderPlaced',userController.ordered)

user_route.get('/orders',authen.islogin,userController.loadOrders)

user_route.get('/details',authen.islogin,userController.loadDetails)

user_route.get('/invoice',authen.islogin,userController.invoice)

user_route.get('/payOnline',authen.islogin,userController.payOnline)

user_route.post('/online',userController.onlinePage)

user_route.post('/payOnline',userController.payOnline)

user_route.get('/payOnlineOrdered',authen.islogin,userController.payOnlineOrdered) 

user_route.get('/payOnlineFailed',authen.islogin,userController.payOnlineFailed) 

user_route.get('/orderAgain',authen.islogin,userController.orderAgain) 

user_route.post('/cancelOrder',userController.cancelOrder)

user_route.post('/returnOrder',userController.returnOrder)



user_route.get('/addToWish',authen.islogin,userController.addToWishlist)

user_route.get('/wishlist',authen.islogin,userController.loadWish)

user_route.delete('/deleteWish',userController.wishDelete)



user_route.post('/couponApply',userController.applyCoupon)

user_route.get('/removeCoupon',userController.removeCoupon)




user_route.get('/loadWallet',authen.islogin,userController.toWallet)







// sign in with google



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
        
        // console.log(req.user);
        
        
        const user = new User({
            name: req.user.given_name,
            email: req.user.email,
            mobile: "1234567890",
            password: "123",
            verified:"1"
        });

        const userDa = await user.save();
        const userData = await User.findOne({email:req.user.email})
        console.log("userData "+typeof userData);
        console.log("iddddd "+userData._id);

        const token = jwt.sign({ userId: userData._id }, 'your_secret_key', { expiresIn: '1h' });
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000, // Expires in 1 year
        });
        console.log("Token "+token);

        // const token2 = req.cookies.token;
        // const decodedToken = jwt.verify(token2, 'your_secret_key');
        // const userId = decodedToken.userId;
        // console.log("id---"+userId);
        
        res.redirect('/user/tohome')
    }catch(error){
        console.log(error.message);
    }
})





user_route.get('/tohome', async(req, res) => {
    try{
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;

        console.log("home UserID-"+userId);
        console.log("decod",decodedToken);



        const page = parseInt(req.query.page) || 1; 
        const limit = 8;
        const skip = (page - 1) * limit;
        
        const productData = await Product.find().skip(skip).limit(limit);
        const totalProducts = await Product.countDocuments();

        
        let cartData;
        try {
            const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;

        console.log(token);

        

            const cartItems = await Cart.findOne({ userId: userId });
            cartData = cartItems ? await Cart.find({ userId: userId }, { products: 1 }) : null;
            console.log("fgshsgfhs"+cartItems);
        } catch (cartError) {
            console.log("Error fetching cart items:", cartError.message);
            cartData = null;
        }
        const cartItems = await Cart.findOne({ userId: userId });
        console.log("fgshsgfhs"+cartItems);
       
        let wishItems;
        try {
            wishItems = await Wishlist.findOne({ userId: userId });
        } catch (wishError) {
            console.log("Error fetching wish list items:", wishError.message);
            wishItems = null;
        }
        
        const category = await Category.find();

        console.log("loadHome");
        const totalPages = Math.ceil(totalProducts / limit);
        
        
        res.redirect('/user/home' 
            
        );

    }
    catch(error){
        console.log(error.message);
    }
});

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