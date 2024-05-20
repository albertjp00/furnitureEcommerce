const User=require('../model/userModel');
const Product=require('../model/productModel')
const Cart = require("../model/cartModel")
const { productAddPage } = require('./admincontroller');
const Order = require("../model/orderModel")
const myOrder = require('../model/myOrders')
const jwt = require('jsonwebtoken')
const mongoose = require("mongoose")
const { ObjectId, CURSOR_FLAGS } = require('mongodb');

const express = require('express');
const session = require('express-session');
const app = express();


app.use(session({
  secret: 'your-secret-key', // replace with a secure secret
  resave: false,
  saveUninitialized: true,
}));

const nodemailer= require("nodemailer");
const { render } = require('ejs');
const { find, findById } = require('../model/adminModel');
require("dotenv").config()


// load home

const loadHome=async(req,res)=>{
    try{

        if (req.session.user_id) {
            const userId = req.session.user_id
            // User is logged in, allow them to proceed to the requested page
            const productData=await Product.find()
            const cartData = await Cart.find({userId:userId},{products:1})
            console.log(cartData);
        
        console.log("loadHome");
        res.render('home',{ product : productData,cart:cartData}) 
        } else {
            // User is not logged in, redirect to login page
            res.redirect('/user/login');
        }
        
        // console.log("proooooooooooooooooooooo\n"+productData);
    }catch(error){
        console.log(error.message);
    }
}

// lOGIN page load

const loginLoad=async(req,res)=>{
    try{
        if(req.session.user_id)
        {
            res.redirect('/user')
        }
        else
        {
        res.render("login")
        // console.log("loaded login");
        }
    }catch(error){
        console.log(error.message);
    }
}

// login verification

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({ email: email });
        console.log("loginverification"+user);
        if (user) {
            if (user.status === 'Blocked') {
                res.render('login', { message: 'User Blocked' });
            } else if (user.password === password) {
                
                const userData = await User.findOne({email:email})
                req.session.user_id=userData._id;
                // console.log(req.session); // Log the entire session object
                // console.log(req.session.views);
                
                // Generate JWT token
            // const token = jwt.sign({ userId: userData._id }, 'your_secret_key', { expiresIn: '1h' }); // Replace 'your_secret_key' with your actual secret key

            // Send JWT token as a response
            // res.cookie('token', token); // You can also set the token in response headers or body
            
                
                console.log("login->home");
                res.redirect('/user');
            } else {
                res.render('login', { message: 'Password is incorrect' });
            }
        } else {
            res.render('login', { message: 'Email is incorrect' });
        }

    } catch (error) {
        console.log(error.message);
    }
};


// const verifyLogin = async (req, res) => {
//     try {
//         const email = req.body.email;
//         const password = req.body.password;

//         const userData = await user.findOne({ email: email });

//         if (userData) {
//             // Checking  if the email matches
//             if (userData.is_admin === 1 && password === userData.password) {
                
//                 res.render('dashboard.ejs');
//             } else {
//                 res.render('login', { message: "Email and password are incorrect" });
//             }
//         } else {
//             res.render('login', { message: "email and password are incorrect" });
//         }
//     } catch (error) {
//         console.log(error.message);
//         res.render('login', { message: "An error occurred" });
//     }
// };


// to log out

const logout= async(req,res)=>{
    try{
        console.log('logout');
        req.session.destroy()
        // res.clearCookie('token')
        res.redirect('/user')

    }catch(error){
        console.log(error.message);
    }
}

// forgot password 

const forgotPass = async(req,res)=>{
    try{
        
        res.render('sendOTP')

    }catch(error){
        console.log(error.message);
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
    }
}


// user registration

const signUpLoad=async(req,res)=>{
    try{
        if(req.session.user_id)
        {
            res.redirect('/user')
        }
        else
        {
        res.render("signup")
        // console.log("loaded login");
        }
        
        // res.render("signup")

    }catch(error){
        console.log(error.message);
    }
}


// user SIgnUP

const newUser = async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: req.body.password,
        });
        
        const userData = await user.save();
        
        req.session.email=userData.email;

        if (userData) {
            const productData = await Product.find();
            res.redirect("/user/loadOTP")
            console.log("signup->login");
        }
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            // The error code 11000 corresponds to a duplicate key error (unique constraint violation)
            return res.render('signup', { message: 'Email already exists. Please use a different email.' });
        }

        console.log(error.message);
        res.render('signup', { message: 'An error occurred' });
    }
};

// to load otp page 

const otpLoad=async(req,res)=>{
    try{
        res.render("otpsend")

    }catch(error){

    }
}

// to send otp

const getOtp    = async (req,res)=>{
    try {
        // console.log("otp");
        // const email = req.session.temp.email
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
        const errorMessage = "Internal Server Error";
        // return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
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
            
            const userData=await User.findOne({email:useremail})
            console.log("thisss"+userData);
            userData.verified = "1"
            await userData.save()
            console.log(userData+"otp -> home");
            // req.session.user_id=userData._id;
            res.redirect('/user/login')
        } else {
            // OTP is incorrect
            res.render("otpverify", { message: "Incorrect OTP. Please try again." });
        }
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage });
    }
};


// to view product

const viewProduct =  async(req,res)=>{
    try{
        const id=req.query.id
        // id="65e9992c8437c5ce715d9de3"
        const data=await Product.findById(id)
        const similar = data.category
        // console.log(similar);
        // if()
        const similarProduct=await Product.find({category:similar})
        // console.log("similar"+similarProduct);

        // console.log("data"+data);

        res.render('single-product',{product:data,product2:similarProduct})
    }catch(error)
    {
        console.log(error.message);
    }
}


//Adding to cart

const cartAdd = async (req, res) => {
    try {
        const userId = req.session.user_id; // Assuming user ID is stored in session
        const productId = req.query.id; // Assuming productId is provided as a string
        // const Quant = req.query.qty
        const productData = await Product.findByIdAndUpdate(productId,{inCart:"Yes"},{new:true})

        let cartItem = await Cart.findOne({ userId: userId });

        if (!cartItem) {
            cartItem = new Cart({
                _id: new mongoose.Types.ObjectId(), 
                userId: userId,
                products: [{ productId: productId}]
            });
        } else {
            const existingProductIndex = cartItem.products.findIndex(product => product.productId.equals(productId));
            if (existingProductIndex !== -1) {
                // If the product exists, update its quantity
                res.write('<script>alert("Product already exists in Cart.");</script>');
                res.end();
            } else {
                // If the product does not exist, add it to the products array
                cartItem.products.push({ productId: productId});
            }
        }

        const savedCartItem = await cartItem.save();
        console.log("cartItem:::"+savedCartItem);

        res.redirect('/user/loadCart')
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
            // Duplicate key error, product with the same name already exists
            res.write('<script>window.alert("Product already exists in Cart.");</script>');
            
        } else {
            console.error('Error updating cart:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};



// to load cart

const cartLoad = async(req,res)=>{
    try{
        const userId  = req.session.user_id
        
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
        res.render('cart', { product: cartItems });
        
        

    }catch(error){
        console.log(error.message);
    }
}




// to update quantity 

const cartUpdateQuantity = async (req, res) => {
    try {
        const UserId = req.session.user_id
        const { productId, quantity } = req.body;
        console.log("pro" + productId + "quan" + quantity);
        const product = await Product.findOne({ _id: productId })

        

            const updatedCart = await Cart.findOneAndUpdate(
                { userId: UserId, 'products.productId': productId },

                { $set: { 'products.$.quantity': quantity } },

                { new: true })
            res.redirect('/user/loadCart')
        

    } catch (error) {
       
        return res.status(500).json({ error: 'Failed to update quantity in the database' });
    }
};




//to delete from cart 

const cartDelete = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const productid = req.query.id; 
    
        
        const deleteProductfromCart = await Product.findByIdAndUpdate(productid,{inCart:"No"},{new:true})
        const deletedCart = await Cart.findOneAndUpdate(
            { userId: userId},
            { $pull: { products: { productId :productid } } },
            { new: true }
          );
        console.log("updated"+deletedCart);
    
        if (deletedCart) {
            // Cart updated successfully
            res.redirect('/user/loadCart');
        } else {
           
            res.status(404).json({ message: 'Cart not found or product not in the cart.' });
        }
    } catch (error) {
        // Handle error
        res.status(500).json({ error: error.message });
    }
    
}


//to load checkout 

const checkout = async(req,res)=>{
    try{
        const userId  = req.session.user_id

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
        // console.log("userdataaaaaaa"+userdata);
        // res.render('Address',{user : userdata})  


        
        
        res.render('checkout',{cart : cartItems,user : userdata})
    }catch(error)
    {
        console.log(error.message);
    }
}

// place  order

const ordered = async(req, res) => {
    try {
        console.log(req.body);
        const userId = req.session.user_id;
        const total = req.query.total;
        console.log("total: " + total);
        console.log(typeof req.body.paymentMethod);
       
        const cartItems = await Cart.findOne({ userId: userId });
        const orderItems= await Order.findOne({userId:userId})

        
        const orderItem = new Order({
            userId: userId,
            products:[],
            totalAmount: total,
            addressId: req.body.address,
            paymentmethod: req.body.paymentMethod
        });

        // Adding placed order to ordersModel
        console.log(userId);
        for (const cartProduct of cartItems.products) {
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
        console.log("saved " + savedOrderItem);

        res.redirect('/user/orders')
    } catch(error) {
        console.log(error.message);
        res.status(500).send("Error in placing order");
    }
}



//to load My orders page 

const loadOrders = async (req, res) => {
    try {
        const userId = req.session.user_id;

        // Find all orders for the given userId
        const orders = await Order.find({ userId: userId });
        if (!orders || orders.length === 0) {
            return res.status(404).send("No orders found for this user");
        }

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
                        status: orderItem.status
                    });
                }
                
            }
            allProductDetails.push(productDetails);
        }

        console.log("All Product Details:");
        allProductDetails.forEach((products, index) => {
            console.log(`Order ${index + 1}:`, products);
        });

        // Delete items from cart (if needed)
        const cartDelete = await Cart.findOne({ userId: userId });
        if (cartDelete) {
            await Cart.findByIdAndDelete(cartDelete._id);
        }

        res.render('orders', {allProductDetails });
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error"); 
    }
};


// load order details page 


const loadDetails = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const productId = req.query.productId;

        const user = await User.findById(userId)
        
        const order = await Order.findOne({ 
            userId: userId,
            'products.productId': productId 
        });

        
        if (!order) {
            return res.status(404).send("Order not found for this user with the specified product");
        }

        const product = await Product.findById(productId);

        
        if (!product) {
            return res.status(404).send("Product not found");
        }
        console.log("pro--  "+product)
        console.log("order--  "+order)
        
        res.render('ordersDetails', { product, order, user });
    } catch (error) {
        console.error("Error loading order and product details:", error);
        res.status(500).send("Internal Server Error");
    }
}






// load profile page 

const loadProfile = async(req,res)=>{
    try{
        const userid = req.session.user_id
        console.log(userid);
        // const userdata = await User.findByIdAndUpdate({userId:userid},{$addToSet:{address:{home:req.body.home,country:req.body.country}}})
        const userData = await User.findOne({_id:userid})
        console.log("dataaa"+userData);

        res.render('profile',{user:userData})
    }catch(error)
    {
        console.log(error.message);
    }
}

// to edit profile

const editProfile = async (req, res) => {
    try {
        // console.log("inherer");
        const userId = req.session.user_id;
        
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
        return res.status(500).json({ error: 'Failed to edit profile' });
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
        const userId = req.session.user_id;
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
        return res.status(500).json({ error: 'Failed to verify current password' });
    }
}





// to change password 

const passwordChange = async (req, res) => {
    try {
        // console.log("inherer");
        const userId = req.session.user_id;
        
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
        return res.status(500).json({ error: 'Failed to edit profile' });
    }
};

//to load Address

const loadAddress = async(req,res)=>{
    try{
        const userid = req.session.user_id
        const userdata = await User.findOne({_id:userid})
        console.log("userdataaaaaaa"+userdata);
        res.render('addAddress',{user : userdata})
    }catch(error)
    {
        console.log(error.message);
    }
}

// to add address

const addAddress = async (req, res) => {
    try {
        const userId = req.session.user_id;
        
        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const newAddress = {
            houseAddress: req.body.houseAddress,
            country: req.body.country
        };

        // Check if the houseAddress already exists for this user
        const existingAddress = user.address.find(addr => addr.houseAddress === newAddress.houseAddress);
        if (existingAddress) {
            return res.send('<script>alert("Address already Exists! Please Try Again"); window.location="/user/toAddress";</script>');
        }

        user.address.push(newAddress);

        await user.save();
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

// to delete address 

const deleteAddress = async (req, res) => {
    try {
        // console.log("inherer");
        const userId = req.session.user_id;
        const id = req.query.id
        
    
        
        const deletedAddr = await User.findOneAndUpdate(
            { _id: userId},
            { $pull: { address: { _id : id } } },
            { new: true }
          );
          
        // console.log('deleted'+deletedAddr);

        console.log("deleted ddddd");
        res.redirect('/user/profile')
        // return res.status(200).json({ message: 'Address added successfully', user: user });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: 'Failed to add address' });
    }
};

//load  edit address

const addressEdit = async (req, res) => {
    try {
        const userId = req.session.user_id; 
        const addressId = req.query.id; 
        console.log(userId,addressId);
        
        const user = await User.findOne({ _id: userId });
        console.log(user);
        
        const selectedAddress = user.address.find(address => address._id == addressId);

        if (!selectedAddress) {

            return res.status(404).send("Address not found");
        }

        res.render('editAddress', { user: user, address: selectedAddress });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}



// to edit address 

const editAddress = async (req, res) => {
    try {
        // console.log("inherer");
        const userId = req.session.user_id;
        const id = req.query.id
        console.log("iddddddddd "+id);

        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found'});
        }
         
const newAddress = {
            houseAddress: req.body.houseAddress,
            country: req.body.country
        };

        const existingAddress = user.address.find(addr => addr.houseAddress === newAddress.houseAddress);
        if (existingAddress) {
            return res.send('<script>alert("Address already Exists! Please Try Again"); window.location="/user/profile";</script>');
            
        }


        const edited = await User.findOneAndUpdate(
            { 
            _id: userId,
                "address._id": id // Match the address ID in the array
            },
            {
                $set: {
                    "address.$.houseAddress": req.body.houseAddress, // Update houseAddress
                    "address.$.country": req.body.country // Update country
                }
            },
            { new: true }
        )
        
          
        console.log("edited dddddddddddd "+edited);

        
        res.redirect('/user/profile')
        // return res.status(200).json({ message: 'Address added successfully', user: user });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: 'Failed to add address' });
    }
};

// filter

// price low to high

const priceLTH = async(req,res)=>{
    try{
        
        const productData = await Product.find().sort({price:1})
        // console.log("userdataaaaaaa "+productData);

         

        res.render('home',{product : productData})
    }catch(error)
    {
        console.log(error.message);
    }
}

const priceHTL = async(req,res)=>{
    try{
        
        const productData = await Product.find().sort({price:-1})
        // console.log("userdataaaaaaa "+productData);

         

        res.render('home',{product : productData})
    }catch(error)
    {
        console.log(error.message);
    }
}

const latest = async(req,res)=>{
    try{
        
        const productData = await Product.find().sort({date:-1})
        // console.log("userdataaaaaaa "+productData);

         

        res.render('home',{product : productData})
    }catch(error)
    {
        console.log(error.message);
    }
}


const AtoZ = async(req,res)=>{
    try{
        
        const productData = await Product.find().sort({name:1})
        // console.log("userdataaaaaaa "+productData);

         

        res.render('home',{product : productData})
    }catch(error)
    {
        console.log(error.message);
    }
}

const ZtoA = async(req,res)=>{
    try{
        
        const productData = await Product.find().sort({name:-1})
        // console.log("userdataaaaaaa "+productData);

         

        res.render('home',{product : productData})
    }catch(error)
    {
        console.log(error.message);
    }
}

const inStock = async(req,res)=>{
    try{
        
        const productData = await Product.find({stock:{$gt:0}})
        // console.log("userdataaaaaaa "+productData);

         

        res.render('home',{product : productData})
    }catch(error)
    {
        console.log(error.message);
    }
}

const search = async(req,res)=>{
    try{
        const input = req.body.search
        const products = await Product.find({ name: { $regex: new RegExp(input, "i") } });        // console.log("userdataaaaaaa "+productData);

         

        res.render('home',{product : products})
    }catch(error)
    {
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
    cartAdd,
    cartLoad,
    cartUpdateQuantity,
    cartDelete,
    checkout,
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
    priceLTH,
    priceHTL,
    latest,
    AtoZ,
    ZtoA,
    inStock,
    ordered,
    loadOrders,
    loadDetails,
    search
}