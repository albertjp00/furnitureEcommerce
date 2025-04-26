const express = require('express');
const session = require('express-session');
const app = express();


app.use(session({
  secret: 'your-secret-key', 
  resave: false,
  saveUninitialized: true,
}));

const jwt = require('jsonwebtoken')

const Razorpay = require("razorpay")

// require('dotenv').config()
const User=require('../model/userModel');
const Product=require('../model/productModel')
const Cart = require("../model/cartModel")
const Category = require("../model/categoryModel")
const Coupon = require("../model/couponModel")
const Order = require("../model/orderModel")
const Wishlist = require("../model/wishlist")
const Wallet = require("../model/walletModel")
const wishlist = require('../model/wishlist');
const Offer = require('../model/offerModel')
const Address = require('../model/addressModel')
// const jwt = require('jsonwebtoken')
const mongoose = require("mongoose")
const { ObjectId, CURSOR_FLAGS } = require('mongodb');

require('dotenv').config();

const secretKey = process.env.JWT_SECRET || 'your_default_secret_key';



const cookieParser = require('cookie-parser');

// Use cookie parser middleware
app.use(cookieParser());

const PDFDocument=require("pdfkit")


const nodemailer= require("nodemailer");
const { render } = require('ejs');
const { find, findById } = require('../model/adminModel');


require("dotenv").config()

const RAZORPAY_ID_KEY= process.env.RAZORPAY_ID_KEY;
const RAZORPAY_SECRET_KEY = process.env.RAZORPAY_SECRET_KEY




const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY, // Pass your Razorpay key ID
    key_secret: RAZORPAY_SECRET_KEY // Pass your Razorpay key secret
});

console.log("keyyyyyyyyyy",razorpayInstance.key_id);


// load home

const loadHome = async (req, res) => {
    try {
        console.log(req.cookies);
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).send(' Unauthorized: No JWT token provided');
        }

        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;


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
            const cartItems = await Cart.findOne({ userId: userId });
            cartData = cartItems ? await Cart.find({ userId: userId }, { products: 1 }) : null;
            console.log("fgshsgfhs"+cartItems);
        } catch (cartError) {
            console.log("Error fetching cart items:", cartError.message);
            cartData = null;
        }
        const cartItems = await Cart.findOne({ userId: userId });
       
        let wishItems;
        try {
            wishItems = await Wishlist.findOne({ userId: userId });
        } catch (wishError) {
            console.log("Error fetching wish list items:", wishError.message);
            wishItems = null;
        }
        
        const category = await Category.find();

        const totalPages = Math.ceil(totalProducts / limit);
        
        
        res.render('home', { 
            product: productData,
            cart: cartItems,
            wish: wishItems,
            category: category || {},
            currentPage: page, 
            totalPages: totalPages 
        });
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}




// lOGIN page load

const loginLoad=async(req,res)=>{
    try{
        
        res.render("login")        
    }catch(error){
        console.log(error.message);
        res.render('error');
    }
}

// login verification

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        // Find the user by email
        const user = await User.findOne({ email: email });  

        if (user) {
            if (user.status === 'Blocked') {
                res.render('login', { message: 'User Blocked' });
            } else if (user.password === password) {
                // generating JWT token
                const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1h' });
 
                res.cookie("token", token, {
                    httpOnly: true,
                    maxAge: 60 * 60 * 1000, // Expires in 1 year
                });

                console.log("login->home",req.cookies);
                res.redirect('/user/home');
            } else {
                res.render('login', { message: 'Password is incorrect' });
            }
        } else {
            res.render('login', { message: 'Email is incorrect' });
        }

    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
};






// to log out

const logout = async (req, res) => {
    try {
        console.log('logout');
        res.cookie('token', '', { expires: new Date(0) });
        res.redirect('/user');
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
};



// forgot password 

const forgotPass = async(req,res)=>{
    try{
        
        res.render('sendOTP')

    }catch(error){
        console.log(error.message);
        res.render('error');
    }
}

// forgot password 

const sendingOTP = async(req,res)=>{
    try{
        const user = await User.findOne({email:req.body.email})
        if(!user)
        {
            console.log("doesn't");
            return res.render('sendOTP', { message: `Email doesn't exists` });
        }
        else{
            req.session.email=user.email;
            const otpcode = Math.floor(1000 + Math.random() * 9000).toString()
        req.session.otp = otpcode
        console.log(otpcode+" code")
        
        // console.log(email);
        // console.log(process.env.SMTP_PASSWORD);

        const transporter = nodemailer.createTransport({
            service:"gmail",
            host : "smtp.gmail.com",
            port: 587,
            secure: false, // Use `true` for port 465, `false` for all other ports
            auth: {
              user: process.env.SMTP_MAIL,
              pass: process.env.SMTP_PASSWORD,
            },
          });
        
        
        
            // send mail with defined transport object
            const mailOptions = {
              from: {
                name: 'Me',
                address:process.env.SMTP_MAIL
              }, 
              to: "albertjpaul@gmail.com", // list of receivers
              subject: "Hello ✔", 
              text: `Your OTP is ${otpcode}`, 
              html: `Your OTP is ${otpcode}`, 
              
            };
        
            const sendMail = async() => {
                try{
                    const a = await transporter.sendMail(mailOptions)
                    console.log("Email sent");
                    
                    res.render('otpverifying')
                }catch(error)
                {
                    console.log(error.message);
                }
            }
        
            sendMail(transporter,mailOptions)
        }
        

    }catch(error){
        console.log(error.message);
        res.render('error');
    }
}

// otp checking      

const OTPchecking = async (req, res) => {
    try {
        const enteredOtp = req.body.otp;
        const storedOtp = req.session.otp;
        const useremail = req.session.email
    
        if (enteredOtp === storedOtp) {
            // OTP is correct
            const useremail = req.session.email
            
            const userData=await User.findOne({email:useremail})
            console.log("thisss"+userData);
            userData.verified = "1"
            await userData.save()
            console.log(userData+"otp -> home");
            // req.session.user_id=userData._id;
            res.render('passwordSet')
        } else {
            // OTP is incorrect
            res.render("otpverifying", { message: "Incorrect OTP. Please try again." });
        }
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage });
    }
};


//password setting 

const resetPassword=async(req,res)=>{
    try{
        console.log(req.body);
        const p1 = req.body.password1
        const p2 = req.body.password2
       
        console.log("p111 "+p1,"p222 "+p2);
        const useremail = req.session.email
        const user = await User.findOne({email:useremail})
        if(p1 == p2)
        {
            user.password = p1
            user.save()
            res.redirect('/user/login')
        }

    }catch(error){
        console.log(error.message);
        res.render('error');
    }
}


// user registration

const signUpLoad=async(req,res)=>{
    try{
        res.render("signup")

    }catch(error){
        console.log(error.message);
        res.render('error');
    }
}


// user SIgnUP

const newUser = async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email, verified: '0' });

        if (existingUser) {
            // If an existing unverified user with the same email is found, update their details
            existingUser.name = req.body.name;
            existingUser.mobile = req.body.mobile;
            existingUser.password = req.body.password;

            const updatedUser = await existingUser.save();
            if (updatedUser) {
                // Proceed to OTP verification
                res.render("otpsend");
                return;
            }
        }
        // Check if a user with the same email and verified status exists
        const existingVerifiedUser = await User.findOne({ email: req.body.email, verified: '1' });
        
        if (existingVerifiedUser) {
            // If an existing verified user with the same email is found, send an error message
            res.render('signup', { message: 'Email is already Exists.' });
            return;
        }

        // If no existing unverified user is found, create a new user
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: req.body.password,
        });
 
        const userData = await user.save();

        if (userData) {
            // Proceed to OTP verification
            res.render("otpsend");
        }
    } catch (error) {
        console.log("error", error.message);
        res.render('signup', { message: 'An error occurred' });
    }
};


// to load otp page 

const otpLoad=async(req,res)=>{
    try{
        res.render("otpsend")

    }catch(error){
        res.render('error');
    }
}

// to send otp

const getOtp    = async (req,res)=>{
    try {
        
        const otpcode = Math.floor(1000 + Math.random() * 9000).toString()
        req.session.otp = otpcode
        console.log(otpcode+" code")
        
      

        const transporter = nodemailer.createTransport({
            service:"gmail",
            host : "smtp.gmail.com",
            port: 587,
            secure: false, // Use `true` for port 465, `false` for all other ports
            auth: {
              user: process.env.SMTP_MAIL,
              pass: process.env.SMTP_PASSWORD,
            },
          });
        
        
        
            // send mail with defined transport object
            const mailOptions = {
              from: {
                name: 'Me',
                address:process.env.SMTP_MAIL
              }, // sender address
              to: "albertjpaul@gmail.com", // list of receivers
              subject: "Hello ✔", // Subject line
              text: `Your OTP is ${otpcode}`, // plain text body
              html: `Your OTP is ${otpcode}`, // html body
              
            };
        
            const sendMail = async() => {
                try{
                    const a = await transporter.sendMail(mailOptions)
                    console.log("Email sent");
                    
                    res.render('otpverify')
                }catch(error)
                {
                    console.log(error.message);
                }
            }
        
            sendMail(transporter,mailOptions)

        

    }catch (error) {
        console.log(error);
        res.render('error');
    }
}

// to verify otp in  page

const OTPcheck = async (req, res) => {
    try {
        const enteredOtp = req.body.otp;
        const storedOtp = req.session.otp;
    
        if (enteredOtp === storedOtp) {
            // OTP is correct
            const useremail = req.session.email
            
            const userData=await User.findOne({verified:"0"})
            console.log("thisss"+userData);
            userData.verified = "1"
            await userData.save()
            console.log(userData+"otp -> home");
            
            res.redirect('/user/login')
        } else {
            // OTP is incorrect
            res.render("otpverify", { message: "Incorrect OTP. Please try again." });
        }
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        res.render('error');
    }
};


// to view product

const viewProduct =  async(req,res)=>{
    try{
        const id=req.query.id
        
        const data=await Product.findById(id)
        const similar = data.category
       
        const similarProduct=await Product.find({category:similar})
        

        res.render('single-product',{product:data,product2:similarProduct})
    }catch(error)
    {
        console.log(error.message);
        res.render('error');
    }
}


//Adding to cart----------------------------------------------------------------------------------------------------------------------------------

const cartAdd = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId; 

        const productId = req.query.id; 
        console.log(userId);
        
        let cartItem = await Cart.findOne({ userId: userId });
        console.log(Cart);

        if (!cartItem) {
            cartItem = new Cart({
                _id: new mongoose.Types.ObjectId(), 
                userId: userId,
                products: [{ productId: productId}]
            });
            console.log(cartItem);
            await cartItem.save()
        } else {
            const existingProductIndex = cartItem.products.findIndex(product => product.productId.equals(productId));
            if (existingProductIndex !== -1) {
                // If the product exists, update its quantity
                return res.send('<script>alert("Product already exists in Wishlist."); window.location="/user/wishlist";</script>');
            } else {
                // If the product does not exist, add it to the products array
                cartItem.products.push({ productId: productId});
            }
        }

        // Calculate total amount
        let totalAmount = 0;
        for (const product of cartItem.products) {
            // Find the product price from the database and multiply it by the quantity
            const productData = await Product.findById(product.productId);
            totalAmount += productData.price * product.quantity;
        }

        // Update totalAmount in the cart document
        cartItem.totalAmount = totalAmount;

        // Save the cart changes to the database
        await cartItem.save();

        console.log("Cart Item:", cartItem);
        res.redirect('/user/loadCart');
    } catch (error) {
        console.error('Error updating cart:', error);
        res.render('error');
    }
};
// _id: new mongoose.Types.ObjectId()








// to load cart

const cartLoad = async(req,res)=>{
    try{
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        console.log("adsgadf",await Cart.find({userId:userId}));
        
        const cartItems = await Cart.aggregate([
            {
                $match: { userId: userId } 
            }, 
            {
                $unwind: "$products" 
            },
            {
                $lookup: {
                    from: "products",
                    localField: "products.productId", 
                    foreignField: "_id", 
                    as: "productDetails" 
                }
            },
            {
                $unwind: "$productDetails" 
            },
            {
                $project: {
                    _id: 0, 
                    product: "$productDetails", 
                    quantity: "$products.quantity"
                }
            }
        ]);
        
        
        console.log("Product Details:", cartItems);

        const cart = await Cart.findOne({ userId: userId });

        let newTotalAmount = 0;
        for (const item of cartItems) {
            newTotalAmount += item.product.price * item.quantity;
        }

        // Update the cart with the new total amount
        cart.totalAmount = newTotalAmount;
        await cart.save();
        

        res.render('cart', { product: cartItems });
        
        

    }catch(error){
        console.log(error.message);
        res.render('error');
    }
}




// to update quantity 

const cartUpdateQuantity = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const UserId = decodedToken.userId;

        const { productId, quantity } = req.body;
        console.log("pro" + productId + "quan" + quantity);
        const product = await Product.findOne({ _id: productId })
        let cartItem = await Cart.findOne({ userId: UserId });
        

        const updatedCart = await Cart.findOneAndUpdate(
            { userId: UserId, 'products.productId': productId },

            { $set: { 'products.$.quantity': quantity } },

            { new: true })

            // Recalculate total amount based on updated quantities
        let totalAmount = 0;
        for (const item of updatedCart.products) {
            const product = await Product.findOne({ _id: item.productId });
            totalAmount += product.price * item.quantity;
        }

        // Update the total amount in the cart
        updatedCart.totalAmount = totalAmount;
        await updatedCart.save();
        
        
        
    
        res.redirect('/user/loadCart')
        

    } catch (error) {
       
        res.render('error');
    }
};




//to delete from cart 

const cartDelete = async(req,res)=>{
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        const productid = req.query.id; 
    
        
        const deletedCart = await Cart.findOneAndUpdate(
            { userId: userId},
            { $pull: { products: { productId :productid } } },
            { new: true }
          ); 
        console.log("updated"+deletedCart);

        
    
        if (deletedCart) {
            let newTotalAmount = 0;
            for (const product of deletedCart.products) {
                // Assuming you have a Product model to fetch product prices
                const productData = await Product.findById(product.productId);
                if (productData) {
                    newTotalAmount += productData.price * product.quantity;
                }
            }

            // Update the cart with the new total amount
            deletedCart.totalAmount = newTotalAmount;
            await deletedCart.save();
            res.redirect('/user/loadCart');
        } else {
           
            res.status(404).json({ message: 'Cart not found or product not in the cart.' });
        }
    } catch (error) {
        // Handle error
        res.render('error');
    }
    
}


//to load checkout ----------------------------------------------------------------------------------------------------------------------------

const checkout = async(req,res)=>{
    try{
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        const carts = await Cart.find()
        if(!carts)
            {
                res.redirect('/user/home')
            }

        const cartItems = await Cart.aggregate([
            {
                $match: { userId: userId } 
            },
            {
                $unwind: "$products" 
            },
            {
                $lookup: {
                    from: "products", 
                    localField: "products.productId", 
                    foreignField: "_id", 
                    as: "productDetails" 
                }
            },
            {
                $unwind: "$productDetails" 
            },
            {
                $project: {
                    _id: 0, //
                    product: "$productDetails", 
                    quantity: "$products.quantity",
                    coupon:"$cart.coupon"
                }
            }
        ]);
        const userdata = await User.findOne({_id:userId})
        console.log("userdataaaaaaa"+userdata);
        // res.render('Address',{user : userdata})  
        const cartItems2 = await Cart.findOne({userId:userId})
        if(!cartItems2)
            {
                res.redirect('/user/home')
            }
            else{
        let totalAmount =  cartItems2.totalAmount
            }
        
        

        const coupons = await Coupon.find();
const user = await User.findById(userId);
//removing code already used by user
const notUsedCoupons = coupons.filter(coupon => !user.coupons.some(userCoupon => userCoupon.code === coupon.code));

        //  console.log("cartitems",cartItems);
         
        const address = await Address.find({userId:userId})
        // if (address.length === 0 || address.some(a => a.houseAddress === 'nill')) {
        //     return res.send('<script>alert("Please update your address before proceeding to checkout."); window.location="/user/checkout";</script>');
        // }
        
        console.log("addresssss",address);
        
        res.render('checkout',{cart : cartItems,user : userdata , address:address , cartItems:cartItems2,coupons:notUsedCoupons})
    }catch(error)
    {
        console.log(error.message);
        res.render('error');
    }
}

// APPLYING     COUPON  -----------------------------------------------------------------------------------------------------------------------------

const applyCoupon = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId; 

        const coupons  = await Coupon.find()
        const User = await User.find(userId)
        console.log("coupons - "+coupons)
        console.log("user - "+User)
        
        const user = await User.findById(userId)
        const cart = await Cart.findOne({ userId: userId });
        const coupon = await Coupon.findOne({ code: req.body.value }); // Use req.body.value to access the coupon code
        console.log("sssdd"+coupon);
        console.log(req.body.value);
        
        if (!coupon) {
            return res.status(400).json({ success: false, message: 'Coupon Not Available' });
        }

        // Check if the coupon has already been applied
        for (let userCoupon of user.coupons) {
            if (userCoupon.code === coupon.code && userCoupon.applied) {
                return res.status(400).json({ success: false, message: 'Coupon Already Applied' });
            }
        }

        cart.couponCode = req.body.value

        
        cart.totalAmount -= coupon.amount;

        if(cart.totalAmount <10)
            {
                return res.json({ success: false });
            }
        cart.coupon = true;

        
        await cart.save();

        user.coupons.push({ code: coupon.code, applied: true });
        await user.save();

        cart.coupon = true;
        await cart.save();
        
        return res.json({ success: true });

        // res.redirect('/user/checkout');
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

// to remove Coupon

const removeCoupon = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId; 
        
        const user = await User.findById(userId)
        const cart = await Cart.findOne({ userId: userId });
        
        const couponCode = cart.couponCode 
        const coupon = await Coupon.findOne({ code: couponCode });
        console.log("sssdd"+coupon);
        
        
        

        // Apply coupon if it's valid
        cart.totalAmount += coupon.amount;
        cart.coupon = false;
        cart.couponCode = "nill"
        await cart.save();

        const indexToRemove = user.coupons.findIndex(coupon => coupon.code === couponCode);

        // If the index is found, remove the coupon
        if (indexToRemove !== -1) {
            user.coupons.splice(indexToRemove, 1);
        }

// Save the user document after removing the coupon
await user.save();// Mark the coupon as applied for the user
        user.coupons.pull({ code: coupon.code, applied: false });
        await user.save();

        // Mark the coupon as true in cart
        cart.coupon = false;
        await cart.save();

        console.log("hello");
        // return res.status(200).json({ success: true, message: 'Coupon removed successfully' });

        res.redirect('/user/checkout');
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

// place  order creating order document 

const ordered = async(req, res) => {
    try {
        if(req.body.paymentMethod == "Cash On Delivery"){ 
            // console.log("b0dy",req.body.houseAddress,);
            // console.log("b0dy",req.body.place);
            // console.log("b0dy",req.body.pincode);
            // console.log("b0dy",req.body.country);


            // console.log(asdf);

            
    
            const token = req.cookies.token;
            const decodedToken = jwt.verify(token, 'your_secret_key');
            const userId = decodedToken.userId;


            const address = await Address.find({ userId: userId });
            console.log("address nll");
            
            if (address.length === 0 || address.some(a => a.houseAddress === 'nill')) {
                return res.send('<script>alert("Please update your address before proceeding to checkout."); window.location="/user/checkout";</script>');
            }
            


        const total = req.query.total;
        console.log("total: " + total);
        console.log(typeof req.body.paymentMethod);
       
        const cartItems = await Cart.findOne({ userId: userId });
        const orderItems= await Order.findOne({userId:userId})

        
        const orderItem = new Order({
            userId: userId,
            products: [],
            totalAmount: cartItems.totalAmount,
            paymentmethod: req.body.paymentMethod,
            addressId:req.body.id,
            place:req.body.place,
            pincode:req.body.pincode,
            country:req.body.country, 
            date: new Date()
        });

        
        console.log("orderItem"+orderItem.addressId);
      
        console.log(userId);
        for (const cartProduct of cartItems.products) {
            const productDetails = await Product.findById(cartProduct.productId);
            if (productDetails) {
                orderItem.products.push({
                    productId: cartProduct.productId,
                    quantity: cartProduct.quantity,
                    price: productDetails.price
                });
                
                console.log("stockkk-"+productDetails.stock);
                productDetails.stock--
                productDetails.count++
                await productDetails.save()
                const product = await Product.find(); // Assuming this returns an array of products
                
                    const category = await Category.findOneAndUpdate(
                        { name: productDetails.category.name },
                        { $inc: { count: 1 } }, // Increment the count by 1
                        { new: true } // Return the updated document
                    );
                    // console.log(category); // Optionally, you can log the updated category document
                
                console.log("stockkk222------"+productDetails.stock,productDetails.count);
            }
        }
        

        // checking if coupon applied 

        if(cartItems.coupon){
            orderItem.coupon = true
        }
    
    

        const savedOrderItem = await orderItem.save();

        if(orderItem.paymentmethod == "PayPal")
        {
            console.log("online paymenttttttttttttttttttttt");
        }
        console.log("saved " + savedOrderItem);

        res.redirect('/user/orders')
    }
    // addin g the products details to orders model and renderin online payment page 
    // if online payment 
    else
    {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;  
        const cartItems = await Cart.aggregate([
            {
                $match: { userId: userId } 
            },
            {
                $unwind: "$products" 
            },
            {
                $lookup: {
                    from: "products", 
                    localField: "products.productId", 
                    foreignField: "_id", 
                    as: "productDetails" 
                }
            },
            {
                $unwind: "$productDetails" 
            },
            {
                $project: {
                    _id: 0, //
                    product: "$productDetails", 
                    quantity: "$products.quantity"
                }
            }
        ]);
        const userdata = await User.findOne({_id:userId})
        



        // to save data to database

        const total = req.query.total;
        console.log("total: " + total);
        
       
        const cartItems2 = await Cart.findOne({ userId: userId });
        console.log("222222222" + JSON.stringify(cartItems2));
        const orderItems= await Order.findOne({userId:userId})

        
        const orderItem = new Order({
            userId: userId,
            products:[],
            totalAmount: cartItems2.totalAmount,
            addressId:req.body.id,
            paymentmethod: req.body.paymentMethod,
            date:new Date()
        });


        // Adding placed order to ordersModel
        console.log(userId);
        for (const cartProduct of cartItems2.products) {
            const productDetails = await Product.findById(cartProduct.productId);
            if (productDetails) {
                orderItem.products.push({
                    productId: cartProduct.productId,
                    quantity: cartProduct.quantity,
                    price: productDetails.price,
                    status:"Order Placed"
                });
                
                console.log("stockkk/"+productDetails.stock);
                productDetails.stock--
                productDetails.count++
                await productDetails.save()
                console.log("stockkk222"+productDetails.stock);
            }
        }
        
        
    
            // checking if coupon applied 

            if(cartItems2.coupon){
                orderItem.coupon = true
            }


        const savedOrderItem = await orderItem.save();
        if(orderItem.paymentmethod == "PayPal")
        {
            console.log("online saving to database");
        }
        console.log("saved / " + savedOrderItem);


        
        
        res.render('onlinePayment',{cart : cartItems,user : userdata,totalAmount:cartItems2.totalAmount,order:savedOrderItem})
    }
    } catch(error) {
        console.log(error.message);
        res.render('error');    }
}

// payment through online  ---------------------------------------------------------------------------------------------------------------- 


const onlinePage = async(req,res)=>{
    try{
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;

        // to load details from cart  

        const cartItems2 = await Cart.findOne({ userId: userId });
        console.log("2222"+cartItems2);

        const cartItems = await Cart.aggregate([
            {
                $match: { userId: userId } 
            },
            {
                $unwind: "$products" 
            },
            {
                $lookup: {
                    from: "products", 
                    localField: "products.productId", 
                    foreignField: "_id", 
                    as: "productDetails" 
                }
            },
            {
                $unwind: "$productDetails" 
            },
            {
                $project: {
                    _id: 0, //
                    product: "$productDetails", 
                    quantity: "$products.quantity"
                }
            }
        ]);
        const userdata = await User.findOne({_id:userId})
    



        // to save data to database

        const total = req.query.total;
        console.log("total: " + total);
        
       
        
        const orderItems= await Order.findOne({userId:userId})

        
        const orderItem = new Order({
            userId: userId,
            products:[],
            totalAmount: cartItems2.totalAmount,
            addressId: req.body.address,
            paymentmethod: req.body.paymentMethod

        });

        // Adding placed order to ordersModel
        console.log(userId);
        for (const cartProduct of cartItems2.products) {
            const productDetails = await Product.findById(cartProduct.productId);
            if (productDetails) {
                orderItem.products.push({
                    productId: cartProduct.productId,
                    quantity: cartProduct.quantity,
                    price: productDetails.price
                });
                
                console.log("stockkk"+productDetails.stock);
                productDetails.stock--
                await productDetails.save()
                console.log("stockkk222"+productDetails.stock);
            }
        }
    
    

        const savedOrderItem = await orderItem.save();
        if(orderItem.paymentmethod == "PayPal")
        {
            console.log("online saving to database");
        }
        console.log("saved -" + savedOrderItem);
        console.log("itemsssssssssssssssssss - "+cartItems);


        
        
        res.render('onlinePayment',{cart : cartItems,user : userdata})
    }catch(error)
    {
        console.log(error.message);
       
    }
}

// PAYMENTS 

const payOnline = async(req,res)=>{
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId; 
        
        const amount = req.body.amount*100
        const RAZORPAY_ID_KEY = process.env.RAZORPAY_ID_KEY
        console.log("amount-"+amount);
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: 'razorUser@gmail.com'
        }

        razorpayInstance.orders.create(options,
            (err, order)=>{
                if(!err){
                    res.status(200).send({
                        success:true,
                        msg:'Order Created',
                        order_id:order.id,
                        amount:amount,
                        key_id:process.env.RAZORPAY_ID_KEY,
                        key_secret: process.env.RAZORPAY_KEY_SECRET, 
                        
                        contact:"9746007325",
                        name: "Albert",
                        email: "albertjpaul@gmail.com"
                    });
                }
                else{
                    console.log(err);
                    res.status(400).send({success:false,msg:'Something went wrong!'});
                }
            } 
        );

    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}


/// loading details to My orders after online payment 

const payOnlineOrdered = async(req, res) => {
    try {
        console.log("Online paid");
        const id = req.query.id;
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).send("Order not found");
        }

        for (const product of order.products) {
            product.status = "Order Placed";
        }

        await order.save();

        console.log("Updated products:", order.products);
        

        res.redirect('/user/orders')
    
    } catch(error) {
        console.log(error.message);
        res.status(500).send("Error innnnnnn placing order");
    }
}

const payOnlineFailed = async (req, res) => {
    try {
        console.log("in here");
        const id = req.query.id;
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).send("Order not found");
        }
        order.status = "failed"
        for (const product of order.products) {
            product.status = "Failed";
        }

        await order.save();

        console.log("Updated products:", order.products);

        res.redirect("/user/orders");

    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}

const orderAgain = async (req, res) => {
    try {
        console.log("in here");
        const orderId = req.query.orderId;
        const productId = req.query.productId
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).send("Order not found");
        }

        const product = await Product.findById(productId)
        const details = order.products.find(product => product.productId.toString() === productId);
        console.log("products : "+details);
        // console.log(fdsg); 

        res.render("onlinePayment2",{order:order, product:product, orderProduct:details});

    } catch (error) {
        console.log(error.message);
        res.render('error');  
    }
}



//to load My orders page 

const loadOrders = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;

        const carts = await Cart.findOne({userId:userId});
        const order = await Order.find({userid:userId})

        
        

        // Find all orders for the given userId
        const orders = await Order.find({ userId: userId });
        if (!orders || orders.length === 0) {
            return res.status(404).send("No orders found for this user");
        }
        
        const order2 = orders
        

        // Fetch product details for each product in each order
        const allProductDetails = [];
        for (const order of orders) {
            const productDetails = [];
            for (const orderItem of order.products) {
                const product = await Product.findById(orderItem.productId);
                if (product) {
                    productDetails.push({
                        product,
                        quantity: orderItem.quantity,
                        price: orderItem.price,
                        status: orderItem.status,
                        order:order
                    });
                }
                
            }
            allProductDetails.push(productDetails);
        }

        // console.log("All Product Details:");
        allProductDetails.forEach((products, index) => {
            console.log(`Order ${index + 1}:`, products);
        });

        
        

        // Delete items from cart (if needed)
        const cartDelete = await Cart.findOne({ userId: userId });
        if (cartDelete) {
            await Cart.findByIdAndDelete(cartDelete._id);
        }

        res.render('orders', {allProductDetails ,orders,order2:order2});
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};


// load order details page 


const loadDetails = async (req, res) => {
    try {

        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        const id = req.query.orderId
        const productId = req.query.productId;

        const user = await User.findById(userId)
        
        const order = await Order.findById(id);
        // const orders = await Order.findOne()

        
        if (!order) {
            return res.status(404).send("Order not found for this user with the specified product");
        }

        const product = await Product.findById(productId);
        let orderProduct=[] 
        for( const prod of order.products)
        {
            if(prod.productId == productId)
            {
                orderProduct.push(prod)

            }
        }
        
        if (!product) {
            return res.status(404).send("Product not found");
        }
        
        console.log("dfgsdfg",orderProduct);
        
        res.render('ordersdetails', { product, order, user ,orderProduct});
    } catch (error) {
        console.error("Error loading order and product details:", error);
        res.status(500).send("Internal Server Error");
    }
}


// to cancel orders 


const cancelOrder = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        const productId = req.query.id;
        console.log("user-" + userId, "productId: " + productId);

        const data = req.body.returnReason

        const user = await User.findById(userId);

        const order = await Order.findOne({
            userId: userId,
            'products.productId': productId,
            
        });

        if (!order) {
            return res.status(404).send("Order not found");
        }

        // Find the product in the order products array and mark it as cancelled

        for(const product of order.products) {
            if(product.productId == productId) {
                product.status = "Cancelled",
                product.cancelReason = data

                break; // Once found, no need to continue searching
            }
        }

        await order.save();

        const product = await Product.findById(productId)
        
        
        let orderProduct=[] 
        for( const prod of order.products)
        {
            if(prod.productId == productId)
            {
                orderProduct.push(prod)

            }
        }
        if(orderProduct[0].status == 'Delivered')
        {

        let wallet = await Wallet.findOne({userId:userId})

        if (!wallet) {
            wallet = new Wallet({
                userId: userId,
            });
        }

        wallet.refunds.push({
            productId: productId,
            amount: product.price
        });

        // Updating total amount in wallet
        wallet.totalAmount += parseFloat(product.price);

        await wallet.save();
        }

        console.log("Details of the cancelled order:", order);

        res.redirect('/user/orders');
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).send("Internal Server Error");
    }
}


// to return the ordered product 

const returnOrder = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;

        const productId = req.query.productId
        const orderId = req.query.id;
        console.log("user-" + userId, "productId: " + productId,"orderId: "+orderId);
        
        
        const user = await User.findById(userId);

        const order = await Order.findOne({
            userId: userId,
            'products._id': orderId,
            
        });

        if (!order) {
            return res.status(404).send("Order not found");
        }

        // Find the product in the order products array and mark it as cancelled

        for(const product of order.products) {
            if(product.productId == productId) {
                product.status = "Requested for return";

                break; // Once found, no need to continue searching
            }
        }
        
        

        await order.save();

        const product = await Product.findById(productId)

        let wallet = await Wallet.findOne({userId:userId})

        if (!wallet) {
            wallet = new Wallet({
                userId: userId,
            });
        }

        wallet.refunds.push({
            productId: productId,
            amount: product.price
        });

        // Updating total amount in wallet
        wallet.totalAmount += parseFloat(product.price);

        await wallet.save();


        console.log("Details of the returned order:", order);

        res.redirect('/user/orders');
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).send("Internal Server Error");
    }
}
   


// to dowload incoice 

const invoice = async(req,res)=>{
    try {
        const order = await Order.findById(req.query.id);
        if (!order) {
            return res.status(404).send("Order not found");
        }

        // Create PDF document
        const doc = new PDFDocument();
        const filename = `Invoice_${order._id}.pdf`;
        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');

        // Populate invoice data
        doc.fontSize(16).text('Invoice', { align: 'center' });
        doc.moveDown();

        // Order details
        doc.fontSize(12).text(`Order ID: ${order._id}`);
        doc.text(`Date: ${order.date}`);
        doc.text(`Status: ${order.status}`);
        doc.moveDown();

        // Customer details (if available)
        doc.fontSize(14).text('Customer Details:');
        // Add customer details here
        doc.moveDown();

        // Product details
        doc.fontSize(14).text('Product Details:');
        order.products.forEach((product, index) => {
            doc.text(`${index + 1}. Product: ${product.name}, Quantity: ${product.quantity}, Price: ${product.price}`);
        });
        doc.moveDown();

        // Total amount
        doc.fontSize(16).text(`Total Amount: ${order.totalAmount}`, { align: 'right' });

        // Generate PDF
        doc.pipe(res);
        doc.end();
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}


//PROFILE--------------------------------------------------------------------------------------------------------------------------------------


// load profile page 

const loadProfile = async(req,res)=>{
    try{
        
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        console.log(userId);
        // const userdata = await User.findByIdAndUpdate({userId:userid},{$addToSet:{address:{home:req.body.home,country:req.body.country}}})
        const userData = await User.findById(userId)
        console.log("dataaa"+userData);
        const address = await Address.find({userId:userId})

        res.render('profile',{user:userData,address:address})
    }catch(error)
    {
        console.log(error.message);
        res.render('error');
    }
}

// to edit profile

const editProfile = async (req, res) => {
    try {
        // console.log("inherer");
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        
        // console.log("edittt "+userId);
        

        const edited = await User.findOneAndUpdate(
            { 
                _id: userId,
            },
            {
                $set: {
                    name: req.body.name, 
                    mobile: req.body.mobile 
                }
            },
            { new: true }
        )
        
          
        console.log("edited dddddddddddd "+edited);

        res.redirect('/user/profile')

        // return res.status(200).json({ message: 'Address added successfully', user: user });

    } catch (error) {
        console.error(error.message);
        res.render('error');
    }
};

//to load check password 

const loadPasswordCheck = async (req, res) => {
    try {
        
        res.render('passwordCheck')
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: 'Failed to verify current password' });
    }
};


// to check password for password change 
const passwordCheck = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        const userData = await User.findById(userId);
        console.log(userData);
        console.log(req.body.password);
        if (req.body.password === userData.password) {
            
           res.render('passwordChange')
        }

        else{
        return res.send('<script>alert("Wrong Password. Try Again."); window.location="/user/profile";</script>');
        }
    } catch (error) {
        console.error(error.message);
        res.render('error');
    }
}





// to change password 

const passwordChange = async (req, res) => {
    try {
        // console.log("inherer");
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        
        // console.log("edittt "+userId);
        const userData = await User.findById(userId)

        if (req.body.password1 !== req.body.password2) {
            // Passwords don't match, so display an alert and redirect back
            return res.send('<script>alert("Passwords do not match."); window.location="/user/loadChange";</script>');        }
        
        else{
        const edited = await User.findByIdAndUpdate(
            { 
                _id: userId,
            },
            
                {
                    password: req.body.password2,  
                },
            
            { new: true }
        )
        
        
          
        console.log("edited dddddddddddd "+edited);

        res.redirect('/user/profile')

            }
        // return res.status(200).json({ message: 'Address added successfully', user: user });

    } catch (error) {
        console.error(error.message);
        res.render('error');
    }
};

//to load Address-------------------------------------------------------------------------------------------------------------------------------

const loadAddress = async(req,res)=>{
    try{
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        const address = await Address.findOne({userId:userId})
        console.log("adressdataaaaaa"+address);
        res.render('addAddress',{address : address})
    }catch(error)
    {
        console.log(error.message);
    }
}

// to add address

const addAddress = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        
        
        
        
        const newAddress =new Address ({
            userId:userId,
            houseAddress: req.body.houseAddress,
            country: req.body.country,
            place:req.body.place,
            pincode:req.body.pincode

        })

       // Check if the houseAddress already exists for this user
const existingAddress = await Address.findOne({ userId: userId, houseAddress: req.body.houseAddress });

if (existingAddress) {
    return res.send('<script>alert("Address already exists! Please try again."); window.location="/user/toAddress";</script>');
}

        

        await newAddress.save();
        res.redirect('/user/profile');
        
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.houseAddress) {
            // The error code 11000 corresponds to a duplicate key error (unique constraint violation)
            return res.send('<script>alert("Password not matching Please Try Again"); window.location="/user/profile";</script>');
        }

        console.log(error.message);
        res.render('signup', { message: 'An error occurred' });
    }
};

// add address checkout

const loadAddressCheckout = async(req,res)=>{
    try{
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        const address = await Address.find({userId:userId})
        console.log("adressdataaaaaa"+address);
        res.render('addAddressCheckout',{address : address})
    }catch(error)
    {
        console.log(error.message);
    }
}


const addAddressCheckout = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        
        
        
        
        const newAddress =new Address ({
            userId:userId,
            houseAddress: req.body.houseAddress,
            country: req.body.country,
            place:req.body.place,
            pincode:req.body.pincode

        })

       // Check if the houseAddress already exists for this user
const existingAddress = await Address.findOne({ userId: userId, houseAddress: req.body.houseAddress });

if (existingAddress) {
    return res.send('<script>alert("Address already exists! Please try again."); window.location="/user/toAddress";</script>');
}

        

        await newAddress.save();
        res.redirect('/user/checkout');
        
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.houseAddress) {
            // The error code 11000 corresponds to a duplicate key error (unique constraint violation)
            return res.send('<script>alert("Password not matching Please Try Again"); window.location="/user/profile";</script>');
        }

        console.log(error.message);
        res.render('signup', { message: 'An error occurred' });
    }
};

// to delete address 
const deleteAddress = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        const id = req.query.id;
        
        // Delete the address from the user document
        const deletedAddr = await Address.findByIdAndDelete(id);
        
        

        console.log('Address deleted:', deletedAddr);
        res.redirect('/user/profile');
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: 'Failed to delete address' });
    }
};


//load  edit address

const addressEdit = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId; 
        const id= req.query.id; 
        
        
        const address = await Address.findById(id);
        console.log(address);

        if (!address) {

            return res.status(404).send("Address not found");
        }

        res.render('editAddress', { address: address });
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}



// to edit address 

const editAddress = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        const id = req.query.id;

        // Fetch the address to be edited
        const address = await Address.findById(id);
        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }

        // Update address fields
        address.houseAddress = req.body.houseAddress;
        address.country = req.body.country;
        address.place = req.body.place;
        address.pincode = req.body.pincode;

        // Check for existing address (optional)
        // Assuming you have a separate schema for addresses and each user has multiple addresses
        const existingAddress = await Address.findOne({
            userId: userId,
            houseAddress: req.body.houseAddress,
            _id: { $ne: id } // Exclude the current address being edited
        });
        if (existingAddress) {
            return res.send('<script>alert("Address already exists! Please try again."); window.location="/user/profile";</script>');
        }

        // Save the edited address
        await address.save();

        res.redirect('/user/profile');
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: 'Failed to edit address' });
    }
};





// filter----------------------------------------------------------------------------------------------------------------------------------------

// price low to high

const priceLTH = async(req,res)=>{
    try{
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        
        // const productData = await Product.find().sort({price:1})
        const wishItems = await Wishlist.findOne({userId:userId})
        const cartItems = await Cart.findOne({userId:userId})
        const category = await Category.find()
        // console.log("userdataaaaaaa "+productData);

        const page = parseInt(req.query.page) || 1; 
        const limit = 8; 
        const skip = (page - 1) * limit;
        const productData = await Product.find().sort({price: 1}).skip(skip).limit(limit); 
        const totalProducts = await Product.countDocuments(); 
        const totalPages = Math.ceil(totalProducts / limit); 
         

        res.render('home',{product : productData,wish : wishItems,cart : cartItems,category:category,currentPage: page,
            totalPages: totalPages})
    }catch(error)
    {
        console.log(error.message);
        res.render('error');
    }
}

const priceHTL = async(req,res)=>{
    try{
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        
        // const productData = await Product.find().sort({price:-1})
        const wishItems = await Wishlist.findOne({userId:userId})
        const cartItems = await Cart.findOne({userId:userId})
        const category = await Category.find()
        // console.log("userdataaaaaaa "+productData);

        const page = parseInt(req.query.page) || 1; 
        const limit = 8; 
        const skip = (page - 1) * limit;
        const productData = await Product.find().sort({price: -1}).skip(skip).limit(limit); 
        const totalProducts = await Product.countDocuments(); 
        const totalPages = Math.ceil(totalProducts / limit);

         

        res.render('home',{product : productData,wish : wishItems,cart : cartItems,category:category,currentPage: page,
            totalPages: totalPages})
    }catch(error)
    {
        console.log(error.message);
        res.render('error');
    }
}

const latest = async(req,res)=>{
    try{
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        
        // const productData = await Product.find().sort({date:-1})
        const wishItems = await Wishlist.findOne({userId:userId})
        const cartItems = await Cart.findOne({userId:userId})
        const category = await Category.find()
        // console.log("userdataaaaaaa "+productData);

        const page = parseInt(req.query.page) || 1; 
        const limit = 8; 
        const skip = (page - 1) * limit;
        const productData = await Product.find().sort({date: -1}).skip(skip).limit(limit); 
        const totalProducts = await Product.countDocuments(); 
        const totalPages = Math.ceil(totalProducts / limit);

         

        res.render('home',{product : productData,wish : wishItems,cart : cartItems,category:category,currentPage: page,
            totalPages: totalPages})
    }catch(error)
    {
        console.log(error.message);
        res.render('error');
    }
}


const AtoZ = async(req,res)=>{
    try{
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        
        // const productData = await Product.find().sort({name:1})
        const wishItems = await Wishlist.findOne({userId:userId})
        const cartItems = await Cart.findOne({userId:userId})
        const category = await Category.find()
        // console.log("userdataaaaaaa "+productData);

        const page = parseInt(req.query.page) || 1; 
        const limit = 8; 
        const skip = (page - 1) * limit;
        const productData = await Product.find().sort({name: 1}).skip(skip).limit(limit); 
        const totalProducts = await Product.countDocuments(); 
        const totalPages = Math.ceil(totalProducts / limit);

         

        res.render('home',{product : productData,wish : wishItems,cart : cartItems,category:category,currentPage: page,
            totalPages: totalPages})
    }catch(error)
    {
        console.log(error.message);
    }
}

const ZtoA = async(req,res)=>{
    try{
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        
        // const productData = await Product.find().sort({name:-1})
        const wishItems = await Wishlist.findOne({userId:userId})
        const cartItems = await Cart.findOne({userId:userId})
        const category = await Category.find()
        // console.log("userdataaaaaaa "+productData);

        const page = parseInt(req.query.page) || 1; 
        const limit = 8; 
        const skip = (page - 1) * limit;
        const productData = await Product.find().sort({name: -1}).skip(skip).limit(limit); 
        const totalProducts = await Product.countDocuments(); 
        const totalPages = Math.ceil(totalProducts / limit);

         

        res.render('home',{product : productData,wish : wishItems,cart : cartItems,category:category,currentPage: page,
            totalPages: totalPages})
    }catch(error)
    {
        console.log(error.message);
    }
}

const inStock = async(req,res)=>{
    try{
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        
        // const productData = await Product.find({stock:{$gt:0}})
        const wishItems = await Wishlist.findOne({userId:userId})
        const cartItems = await Cart.findOne({userId:userId})
        const category = await Category.find()
        // console.log("userdataaaaaaa "+productData);

        const page = parseInt(req.query.page) || 1; 
        const limit = 8; 
        const skip = (page - 1) * limit;
        const productData = await Product.find({stock:{$gt:0}}).skip(skip).limit(limit); 
        const totalProducts = await Product.countDocuments(); 
        const totalPages = Math.ceil(totalProducts / limit);

         

        res.render('home',{product : productData,wish : wishItems,cart : cartItems,category:category,currentPage: page,
            totalPages: totalPages})
    }catch(error)
    {
        console.log(error.message);
    }
}

const categoryFilter = async(req,res)=>{
    try{
        const categoryname = req.query.name
        
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        
        // const productData = await Product.find({category:categoryname})
        const wishItems = await Wishlist.findOne({userId:userId})
        const cartItems = await Cart.findOne({userId:userId})
        const category = await Category.find()
        // console.log("userdataaaaaaa "+productData);

        const page = parseInt(req.query.page) || 1; 
        const limit = 8; 
        const skip = (page - 1) * limit;
        const productData = await Product.find({"category.name":categoryname}).sort({price: 1}).skip(skip).limit(limit); 
        const totalProducts = await Product.countDocuments(); 
        const totalPages = Math.ceil(totalProducts / limit);

         

        res.render('home',{product : productData,wish : wishItems,cart : cartItems,category:category,currentPage: page,
            totalPages: totalPages})
    }catch(error)
    {
        console.log(error.message);
    }
}


const search = async (req, res) => {
    try {
        const input = req.body.search;
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        
        const page = parseInt(req.query.page) || 1; 
        const productsPerPage = 8; 
        const skip = (page - 1) * productsPerPage;
        const products = await Product.find({ name: { $regex: new RegExp(`^${input}`, "i") } })
            .sort({ name: 1 })
            .skip(skip)
            .limit(productsPerPage);
        const totalProducts = await Product.countDocuments({ name: { $regex: new RegExp(`^${input}`, "i") } });
        const totalPages = Math.ceil(totalProducts / productsPerPage);

        const wishItems = await Wishlist.findOne({ userId: userId });
        const cartItems = await Cart.findOne({ userId: userId });
        const category = await Category.find();

        res.render('home', {
            product: products,
            wish: wishItems,
            cart: cartItems,
            category: category,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}


//to load wishlist ------------------------------------------------------------------------------------------------------------------------

const loadWish = async(req,res)=>{
    try{
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;

        console.log("uuuuuuuuuuu",userId)
        
        const Items = await Wishlist.aggregate([
            {
                $match: { userId: userId } 
            },
            {
                $unwind: "$products" 
            },
            {
                $lookup: {
                    from: "products",
                    localField: "products.productId", 
                    foreignField: "_id", 
                    as: "productDetails" 
                }
            },
            {
                $unwind: "$productDetails" 
            },
            {
                $project: {
                    _id: 0, 
                    product: "$productDetails", 
                    quantity: "$products.quantity"
                }
            }
        ]);
        
        console.log("Product Details:",Items);
        res.render('wishlist', { product: Items });
    }catch(error)
    {
        console.log(error.message);
        res.render('error');
    }
}

// add to wishlist 

const addToWishlist = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId; 
        const productId = req.query.id; 
        console.log(productId);
        
        let wishItem = await Wishlist.findOne({ userId: userId });
        console.log(wishItem);

        if (!wishItem) {
            wishItem = new Wishlist({
                _id: new mongoose.Types.ObjectId(), 
                userId: userId,
                products: [{ productId: productId}]
            });
        } else {
            const existingProductIndex = wishItem.products.findIndex(product => product.productId.equals(productId));
            if (existingProductIndex !== -1) {
                // If the product exists, update its quantity
                return res.send('<script>alert("Product already exists in Wishlist."); window.location="/user/wishlist";</script>');
            } else {
                // If the product does not exist, add it to the products array
                wishItem.products.push({ productId: productId});
            }
        }

        const savedWishItem = await wishItem.save();
        console.log("cartItem:::"+savedWishItem);
        res.redirect('/user/wishlist');
    } catch (error) {
        console.error('Error updating wishlist:', error);
        res.render('error');    }
};


// to remove from wishlist 


const wishDelete = async(req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        const productId = req.query.id; 
        console.log("deleteing wishhhh");
    
        const deletedWish = await Wishlist.findOneAndUpdate(
            { userId: userId},
            { $pull: { products: { productId: productId } } },
            { new: true }
        );

        if (deletedWish) {
            res.status(200).json({ message: 'Product removed from wishlist successfully.' });
        } else {
            res.status(404).json({ message: 'Wishlist not found or product not in the wishlist.' });
        }
    } catch (error) {
        console.log(error.message);
    }
}




// WALLET -----------------------------------------------------------------------------------------------------------


const toWallet = async (req, res) => {
    try {
        const token = req.cookies.token;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const userId = decodedToken.userId;
        const wallet = await Wallet.findOne({ userId: userId });

        if(!wallet)
            {
                const wallet=[]
                const refunds=[]
                const products=[]
                res.render('wallet',{wallet:wallet, refund: refunds, product : products })
            }
        const refunds = wallet.refunds;
        
        // Array to store product promises
        const productPromises = [];
        for (const refund of refunds) {
            const productId = refund.productId;
            const productPromise = Product.findById(productId);
            productPromises.push(productPromise);
        }

        // Wait for all product promises to resolve
        const products = await Promise.all(productPromises);

        res.render('wallet', {wallet:wallet, refund: refunds, product : products });
    } catch (error) {
        console.log(error.message);
        
    }
}






module.exports={
    loadHome,
    signUpLoad,
    newUser,
    forgotPass,
    sendingOTP,
    OTPchecking,
    loginLoad,
    verifyLogin,
    logout,

    otpLoad,
    getOtp,
    OTPcheck,

    viewProduct,

    //Cart
    cartAdd,
    cartLoad,
    cartUpdateQuantity,
    cartDelete,
    checkout,


    //Profile
    loadProfile,
    editProfile,
    passwordCheck,
    loadPasswordCheck,
    passwordChange,
    resetPassword,
    loadAddress,
    addAddress,
    deleteAddress,
    addressEdit,
    editAddress,
    loadAddressCheckout,
    addAddressCheckout,


    priceLTH,
    priceHTL,
    latest,
    AtoZ,
    ZtoA,
    inStock,
    categoryFilter,
    search,

    //Orders 
    ordered,
    loadOrders,
    loadDetails,
    onlinePage,
    payOnline,
    payOnlineOrdered,
    payOnlineFailed,
    orderAgain,
    cancelOrder,
    returnOrder,
    invoice,
    
    //Wishlist
    loadWish,
    addToWishlist,
    wishDelete,
    
    applyCoupon,
    removeCoupon,
    
    toWallet,
}