const user = require("../model/adminModel.js")
const bcrypt = require("bcrypt")
const Product=require("../model/productModel.js")
const Category=require("../model/categoryModel.js")
const User=require("../model/userModel.js")
const Order = require("../model/orderModel.js")
const Coupon = require("../model/couponModel.js")
const Offer = require("../model/offerModel.js")
const Wallet = require("../model/walletModel.js")
const Address = require("../model/addressModel.js")

const fs = require('fs');
const path = require('path');
const mongoose = require("mongoose")

//load login page 

const loadLogin= async(req,res)=>{
    try{
        
        console.log(req.session.userid);
        res.render("login")
        
    }catch(error)
    {
        console.log(error.message);
    }
}

// to verify admin

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await user.findOne({ email: email });
        console.log("verify login ->"+userData);

        if (userData) {
            if (password === userData.password) {
                req.session.userid=userData._id
                res.redirect('/admin/dashboard');
            } else {
                res.render('login', { message: "Email and password is incorrect" });
            }
        } else {
            res.render('login', { message: "email and password is incorrect" });
        }
    } catch (error) {
        console.log(error.message);
        res.render('login', { message: "An error occurred" });
    }
};

// Logout  ---------------
const logout= async(req,res)=>{
    try{
        console.log('logout');
        console.log(req.session.userid)
        req.session.destroy()
        
        res.redirect('/admin')

    }catch(error){
        console.log(error.message);
    }
}


//load dashboard

const loadDash = async (req, res) => {
    try {
        const products = await Product.find();
        const orders = await Order.find();

        // Calculate total sales
        let totalSales = 0;
        orders.forEach(order => {
            totalSales += parseFloat(order.totalAmount);
        });

        // Fetch monthly sales data
        const monthlySalesData = await Order.aggregate([
            {
                $group: {
                    _id: { $month: "$date" }, // Group by month
                    totalSales: { $sum: { $toDouble: "$totalAmount" } } // Calculate total sales for each month
                }
            },
            {
                $sort: { "_id": 1 } // Sort by month in ascending order
            }
        ]);

        // Format the monthly sales data
        const monthlySalesLabels = [];
        const monthlySales = [];
        monthlySalesData.forEach(month => {
            const monthName = new Date(2000, month._id - 1).toLocaleString('default', { month: 'short' });
            monthlySalesLabels.push(monthName);
            monthlySales.push(month.totalSales.toFixed(2));
        });

        // Fetch yearly sales data
        const yearlySalesData = await Order.aggregate([
            {
                $group: {
                    _id: { $year: "$date" }, // Group by year
                    totalSales: { $sum: { $toDouble: "$totalAmount" } } // Calculate total sales for each year
                }
            },
            {
                $sort: { "_id": 1 } // Sort by year in ascending order
            }
        ]);

        // Format the yearly sales data
        const yearlySalesLabels = [];
        const yearlySales = [];
        yearlySalesData.forEach(year => {
            yearlySalesLabels.push(year._id);
            yearlySales.push(year.totalSales.toFixed(2));
        });
        console.log("1",yearlySalesData,"2",yearlySales);

        const product = await Product.find()
    .sort({ count: -1 }) // Sort by count in ascending order
    .limit(3);

    const category = await Category.find()
    .sort({ count: -1 }) // Sort by count in ascending order
    .limit(3);
    console.log(category);


        res.render('dashboard', {product, category, products, totalSales, orders, monthlySalesLabels, monthlySalesData, yearlySalesData, yearlySales });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};




// to load products page

const loadProduct = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Get page number from query parameters, default to 1
        const limit = 8; // Number of products per page

        const skip = (page - 1) * limit;

        // Fetch products for the current page
        const productsData = await Product.find().skip(skip).limit(limit);
        console.log(productsData);

        // Calculate total number of pages
        const totalProductsCount = await Product.countDocuments();
        const totalPages = Math.ceil(totalProductsCount / limit);

        res.render("page-products-list", { product: productsData, totalPages, currentPage: page });

    } catch (error) {
        console.log(error.message);
    }
}




// to add product page

const productAddPage= async(req,res)=>{
    try{
        const categories = await Category.find()

        res.render("productCreate2",{categories:categories})
    }catch(error)
    {
        console.error("Error rendering productAddPage:", error);
        res.status(500).send("Internal Server Error");
    }
}


// adding product in product page

const addProduct=async(req,res)=>{
    try{
        console.log(req.body);
        const product=new Product({
            name:req.body.name,
            price:req.body.price,
            date:req.body.date,
            image:req.files.map(file=>file.filename),
            color:req.body.color,
            stock:req.body.stock,
            category:{name:req.body.category},
            originalPrice:req.body.price

        })
    
        const productData= await product.save()
        console.log(productData);
    
        if(productData){
            res.redirect("/admin/products")
        }
    }catch(error)
    {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
            res.render('productCreate2',{message:"Error: Product already exists."});
        } else {
            console.log(error.message);
            
        }
    }
} 


// to edit Product

const productEdit = async (req, res) => {
    try {
        const id = req.query.id;

        const productData = await Product.findById(id);
        const categoryData = await Category.find({status:"Active"});

        if (productData) {
            res.render("productEdit", { products: productData, categories: categoryData });
        } else {
        }
    } catch (error) {
        console.log(error.message);
    }
};


//to update product details

const updateProduct = async (req, res) => {
    try {
        const id = req.query.id;
        console.log(req.files);

        // Update other product details
        const productData = await Product.findByIdAndUpdate(id, { 
            name: req.body.name,
            price: req.body.price,
            stock: req.body.stock,
            color: req.body.color,
            category: { name: req.body.category },
            originalPrice: req.body.price,
            $push: { image: req.files.map(file => file.filename) } // Append new image filenames
        }, { new: true }); 
        
        
        
        
            const product = await Product.findById(id)
            if(product.offer)
            {
                product.price =  product.price * (1 - product.offerPercentage / 100); 

            }
            product.save()

           // Remove images selected for deletion
        if (req.body.imagesToRemove && req.body.imagesToRemove.length > 0) {
    // Convert strings to numbers
        const imageIndices = req.body.imagesToRemove.map(index => parseInt(index));

    // Remove images from productData
        productData.image = productData.image.filter((image, index) => !imageIndices.includes(index));

    

    // Perform database update
    await productData.save();
} 

    

        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};



// to unlist  product

const unlistProduct= async (req,res)=>{
    try{
        const id=req.query.id
        // console.log(id);
        const productData = await Product.findByIdAndUpdate(id, { status: "Unlisted" }, { new: true });
        console.log(productData);
        
        res.redirect('/admin/products')
    }catch(error)
    {
        console.log(error.message);
    }
}


// to list product

const toList = async (req,res)=>{
    try{
        const id=req.query.id
        // console.log(id);
        const productData = await Product.findByIdAndUpdate(id, { status: "listed" }, { new: true });
        console.log(productData);
        
        res.redirect('/admin/products')
    }catch(error)
    {
        console.log(error.message);
    }
}




//to show unlisted

const unlisted= async (req,res)=>{
    try{
        
        const productData = await Product.find({ status: "Unlisted" });
        res.render("page-products-unlisted",{product:productData})
    }catch(error)
    {
        console.log(error.message);
    }
}


// to load categories

const loadCategory = async(req,res)=>{
    try{
        // const categoryData =await Category.find()
        const page = parseInt(req.query.page) || 1; // Get page number from query parameters, default to 1
        const limit = 8; // Number of products per page

        const skip = (page - 1) * limit;

        // Fetch products for the current page
        const categoryData = await Category.find().skip(skip).limit(limit);
        // console.log(productsData);

        // Calculate total number of pages
        const totalProductsCount = await Category.countDocuments();
        const totalPages = Math.ceil(totalProductsCount / limit);
        res.render("page-categories",{category:categoryData,totalPages,currentPage:page})

        
    }catch(error){
        console.log(error.message);
    }
}

//to add category

const addCategory = async (req, res) => {
    try {
        console.log(req.body);
        const category = new Category({
            name: req.body.name,
            description: req.body.description,
            date: new Date()
        });

        const categoryData = await category.save();

        if (categoryData) {
            res.redirect("/admin/category");
        }
    } catch (error) {
        console.log(error.message);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
            // Duplicate key error, product with the same name already exists
            const categoryData =await Category.find()
            res.render('page-categories',{message:"Error: Category already exists.",category:categoryData});
            
        }
        // Check for specific error conditions
        if (error.name === 'ValidationError') {
            // Mongoose validation error
            const categoryData =await Category.find()
        res.render("page-categories",{category:categoryData,message:"white Spaces not allowed"})
        } else {
            // Other errors
            console.log(error.message); 
        }
    }
};


// to edit category

const categoryEdit = async(req,res)=>{
    try{
        const id=req.query.id
        
        
        const categoryData1 =await Category.find()

        const categoryData=await Category.findById(id)

        if(categoryData)
        {
            res.render("page-categoryEdit",{category:categoryData,category1:categoryData1})
        
        // else{

        // }
    }
}catch(error)
    {
        console.log(error.message);
    }
}

// to update category

const updateCategory= async(req,res)=>{
    try{
        

       await  Category.findByIdAndUpdate(req.query.id,{name:req.body.name,description:req.body.description},{new:true})
       
       res.redirect('/admin/category')
    }catch(error)
    {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
            // Duplicate key error, product with the same name already exists
            const categoryData =await Category.find()
            res.render('page-categories',{category:categoryData,message:"Category already exists."});
        }
        else{
        console.log(error.message);
            }
    }
}

// to delete category


const unlistCategory= async (req,res)=>{
    try{
        const id=req.query.id
        const category = await Category.findByIdAndUpdate(id, { status: "InActive" }, { new: true });
        await Product.updateMany({"category.name":category.name},{$set:{"category.status":"unlisted"}})        
        res.status(200).json({ message: "Category unlisted successfully" });
    }catch(error)
    {
        console.log(error.message);
    }
}

// to list category 

const listCategory= async (req,res)=>{
    try{
        const id=req.query.id
        const category = await Category.findByIdAndUpdate(id, { status: "Active" }, { new: true });        
        await Product.updateMany({"category.name":category.name},{$set:{"category.status":"listed"}}) 
        res.redirect('/admin/category')
    }catch(error)
    {
        console.log(error.message);
    }
}

// to load unlisted categories

const loadUnlistedCategories= async (req,res)=>{
    try{
        const categories = await Category.find({status:"InActive"})
        res.render("page-categoriesUnlisted",{category:categories})
    }catch(error)
    {
        console.log(error.message);
    }
}


// load user list

const loadUser= async (req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1; // Get page number from query parameters, default to 1
        const limit = 8; // Number of products per page

        const skip = (page - 1) * limit;

        // Fetch products for the current page
        const userData = await User.find().skip(skip).limit(limit);
        

        // Calculate total number of pages
        const Count = await User.countDocuments();
        const totalPages = Math.ceil(Count / limit);
        res.render("page-users-list",{user:userData,totalPages,currentPage:page})
    }catch(error)
    {
        console.log(error.message);
    }
}

// to block user

const blockUser = async (req, res) => {
    try {
        const id = req.query.id;
        console.log("blocked");
        const userData = await User.findByIdAndUpdate(id, { status: "Blocked" }, { new: true });
        console.log(userData);
        res.redirect('/admin/getUser');
    } catch (error) {
        console.log(error.message);
    }
}

const unBlock = async (req, res) => {
    try {
        const id = req.query.id;
        console.log("Unblocked");
        const userData = await User.findByIdAndUpdate(id, { status: "NotBlocked" }, { new: true });
        console.log(userData);
        res.redirect('/admin/getUser');
    } catch (error) {
        console.log(error.message);
    }
}


// orders 


const orders = async (req, res) => {
    try {
        // console.log("Inside loadOrders"); 
        let order = await Order.find();
        let total = 0;
        
        if (req.query.d) {
            order = await Order.find({status: "Delivered"});
        }
        
        if (req.query.r) {
            order.reverse();
        }
        
        for (const totals of order) {
            total += Number(totals.totalAmount);
        }

        
// let discount = 0
        // for(const details of ordersWithProductDetails)
        // {
        //     discount += details.originalPrice - details.price
        // }

        // const orders = await Order.find()
        // const orderSum = orders.length

// to show reverse ordered products 
        
        console.log(total);
        
        res.render('orders', { order: order, total: total }); 
    } catch (error) {
        console.log(error.message);
    }
}


const reverseOrders = async (req, res) => {
    try {
        console.log("Inside loadOrders"); 
        

        const order = await Order.find()
        order.reverse()

        // let discount = 0
        // for(const details of ordersWithProductDetails)
        // {
        //     discount += details.originalPrice - details.price
        // }

        // const orders = await Order.find()
        // const orderSum = orders.length
        

        let total = 0
         
        for(let totals of order)
        {
            total += Number(totals.totalAmount)
            
            // discount += Number(totals.originalPrice) - Number(totals.price)
        }
        console.log(total);

        res.render('orders', {  order : order ,total : total }); 
    } catch (error) {
        console.log(error.message);
    }
}

//to load orderdetails

const loadOrderDetails= async (req,res)=>{
    try{
        const data=await User.find()
        
        const order = await Order.findById(req.query.id)
        let products=[]
        for(const p of order.products)
        {
            const product = await Product.findById(p.productId)
            products.push(product)
        }
        console.log("grouped"+products);
        const address =await  Address.findById(order.addressId)
        console.log(address);
       
        res.render("page-orders-details",{order:order,product:products,address:address})
    }catch(error)
    {
        console.log(error.message);
    }
}

//show only delivered products 

const deliveredOrders = async (req, res) => {
    try {
        console.log("Inside loadOrders");
        const userId = req.session.user_id; 

        const ordersWithProductDetails = await Order.aggregate([
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
                $addFields: {
                    "productDetails.userId": "$userId" // Add userId to productDetails
                }
            },
            {
                $project: {
                    _id: 0,
                    productId: "$productDetails._id",
                    productName: "$productDetails.name",
                    price: "$productDetails.price",
                    image: "$productDetails.image",
                    quantity: "$products.quantity",
                    status:"$products.status",
                    userId: "$productDetails.userId" ,// Include userId in the final result
                    coupon:"$coupon",
                    date:"$date",
                    user:"$userId",
                    orderId:'$products._id',
                    originalPrice:"$productDetails.originalPrice"
                }
            }
        ]);
        
        
        console.log("detailsssssss:",ordersWithProductDetails);
         
        let deliveredDetails = []
        for(const details of ordersWithProductDetails)
        {
            if(details.status == "Delivered")
            {
                deliveredDetails.push(details)

            }
        }

        const orders = await Order.find()
        const orderSum = orders.length
        

        let total = 0
         let discount = 0
        for(let totals of orders)
        {
            total += Number(totals.totalAmount)
            
            discount += Number(totals.originalPrice) - Number(totals.price)
        }
        // console.log(total,discount);


        
        
        res.render('orders', { product: deliveredDetails, order : orderSum ,total : total ,discount:discount}); 
    } catch (error) {
        console.log(error.message);
    }
}

// cancelling order
const cancelOrder = async (req, res) => {
    try {
        const productId = req.query.productId;
        const orderId = req.query.orderId;
        console.log("Product ID:", productId, "Order ID:", orderId);

        // Find the order by ID
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).send("Order not found");
        }

        // Find the index of the product in the order
        const productIndex = order.products.findIndex(product => product._id.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).send("Product not found in the order");
        }

        // Update the status of the product to "Delivered"
        order.products[productIndex].status = "Cancelled";

        // Save the updated order
        await order.save();
        console.log("Details of the cancelled product:");

        res.redirect('/admin/loadDetails');
    } catch (error) {
        console.error("Error delivering order:", error);
        res.status(500).send("Internal Server Error");
    }
}

// /to chnage status of order to delivered

const deliverWholeOrder = async (req, res) => {
    try {
        
        const orderId = req.query.orderId;
        console.log("Order ID:", orderId);

        // Find the order by ID
        const order = await Order.findById(orderId);
        console.log("deliverrrrrrrrrrrrrrrrrrrrrrrrrrr"+order);
        order.status = "Delivered"
        await order.save()
        

        res.redirect('/admin/loadDetails');
    } catch (error) {
        console.error("Error delivering order:", error);
        res.status(500).send("Internal Server Error");
    }
}




// to change status to delivered for orders

const deliverOrder = async (req, res) => {
    try {
        const productId = req.query.productId;
        const orderId = req.query.orderId;
        console.log("Product ID:", productId, "Order ID:", orderId);

        // Find the order by ID
        const order = await Order.findById(orderId);

        

        if (!order) {
            return res.status(404).send("Order not found");
        }

        // Find the index of the product in the order
        const productIndex = order.products.findIndex(product => product._id.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).send("Product not found in the order");
        }

        // Update the status of the product to "Delivered"
        order.products[productIndex].status = "Delivered";

        // Save the updated order
        await order.save();
        console.log("Details of the delivered product:", order.products[productIndex]);


        

        res.redirect('/admin/loadDetails');
    } catch (error) {
        console.error("Error delivering order:", error);
        res.status(500).send("Internal Server Error");
    }
}


const approveReturn = async (req, res) => {
    try {

        const productId = req.query.productId;
        const orderId = req.query.orderId;
        console.log("Product ID:", productId, "Order ID:", orderId);

        // Find the order by ID
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).send("Order not found");
        }

        // Find the index of the product in the order
        const productIndex = order.products.findIndex(product => product._id.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).send("Product not found in the order");
        }

        // Update the status of the product to "Delivered"
        order.products[productIndex].status = "Returned";

        // Save the updated order
        await order.save();
        console.log("Details of the returned product:", order.products[productIndex]);

        res.redirect('/admin/loadDetails');
    } catch (error) {
        console.error("Error delivering order:", error);
        res.status(500).send("Internal Server Error");
    }

}







// to load categories

const loadCoupon = async(req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1; // Get page number from query parameters, default to 1
        const limit = 8; // Number of products per page

        const skip = (page - 1) * limit;

        // Fetch products for the current page
        const couponData = await Coupon.find().skip(skip).limit(limit);
        

        // Calculate total number of pages
        const Count = await Product.countDocuments();
        const totalPages = Math.ceil(Count / limit);
        // const couponData =await Coupon.find()
        const user = await User.find()
        res.render("page-coupon",{coupon:couponData,user:user,totalPages,currentPage:page})
        
    }catch(error){
        console.log(error.message);
    }
}

//to add category

const addCoupon = async (req, res) => {
    try {
        console.log(req.body);
        const coupon = new Coupon({
            name: req.body.name,
            amount: req.body.amount,
            code: req.body.code
        });

        const couponData = await coupon.save();

        if (coupon) {
            res.redirect("/admin/coupon");
        }
    } catch (error) {
        console.log(error.message);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
            // Duplicate key error, product with the same name already exists
            const coupondata =await Coupon.find()
            res.render('page-coupon',{message:"Error: Coupon already exists.",coupon:coupondata});
            
        }
        // Check for specific error conditions
        if (error.name === 'ValidationError') {
            // Mongoose validation error
            const couponData =await Coupon.find()
        res.render("page-coupon",{coupon:couponData,message:"white Spaces not allowed"})
        } else {
            // Other errors
            console.log(error.message); 
        }
    }
};


// to edit category

const couponEdit = async(req,res)=>{
    try{
        const id=req.query.id
        console.log(id);
        
        const couponData1 =await Coupon.find()

        const couponData=await Coupon.findById(id)

        if(couponData)
        {
            res.render("page-couponEdit",{coupon:couponData,coupon1:couponData1})
        
        // else{

        // }
    }
}catch(error)
    {
        console.log(error.message);
    }
}

// to update category

const updateCoupon= async(req,res)=>{
    try{
        

       await  Coupon.findByIdAndUpdate(req.query.id,{name:req.body.name,amount:req.body.amount,code:req.body.code},{new:true})
       
       res.redirect('/admin/coupon')
    }catch(error)
    {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
            // Duplicate key error, product with the same name already exists
            const couponData =await Category.find()
            res.render('page-coupon',{coupon:couponData,message:"Coupon already exists."});
        }
        else{
        console.log(error.message);
            }
    }
}

// to delete coupon


const deleteCoupon= async (req,res)=>{
    try{
        const id=req.query.id
        await Coupon.findByIdAndDelete(id);        
        res.redirect('/admin/coupon')
    }catch(error)
    {
        console.log(error.message);
    }
}




// to add offers -------------------------------------------------------------------------------------------------------------------

const loadOffers = async (req,res)=>{
    try{
        // const id=req.query.id
        const page = parseInt(req.query.page) || 1; // Get page number from query parameters, default to 1
        const limit = 8; // Number of products per page

        const skip = (page - 1) * limit;

        // Fetch products for the current page
        const offers = await Coupon.find().skip(skip).limit(limit);
        

        // Calculate total number of pages
        const Count = await Offer.countDocuments();
        const totalPages = Math.ceil(Count / limit);
        // const offers =await Offer.find()
        const category = await Category.find()
    
        res.render('page-offers',{offer : offers,category:category,totalPages,currentPage:page})
    }catch(error)
    {
        console.log(error.message);
    }
}



//to add offer

const addOffer = async (req, res) => {
    try {
        const offerCategory = req.body.category;
        const offerPercentage = parseFloat(req.body.offer);

        const existingOffer = await Offer.findOne({ category: offerCategory });
        if (existingOffer) {
            return res.send('<script>alert("Offer for this category already exists"); window.history.back();</script>');
        }

        const newOffer = new Offer({
            offer: req.body.offer,
            category: req.body.category
        });
        const offerData = await newOffer.save();

        Product.find({ 'category.name': offerCategory })
            .then(async products => {
                for (const product of products) {
                    product.offer = true;
                    product.price = product.price * (1 - offerPercentage / 100);
                    product.offerPercentage = offerPercentage;
                    await product.save();
                    console.log("Modified product:", product);
                }
                res.redirect("/admin/loadOffer");
            })
            .catch(error => {
                console.error('Error finding products:', error);
                res.status(500).send("Internal Server Error");
            });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
}; 




// // to edit offer

const editOffer = async(req,res)=>{
    try{
        const id=req.query.id
        
        
        const offerData1 =await Offer.find()

        const offerData=await Offer.findById(id)

        if(offerData)
        {
            res.render("page-offersEdit",{offer:offerData,offer1:offerData1})
        
        // else{

        // }
    }
}catch(error)
    {
        console.log(error.message);
    }
}

// // to update offer

const updateOffer= async(req,res)=>{
    try{
        
        console.log(req.query.id);
       await  Offer.findByIdAndUpdate(req.query.id,{offer:req.body.offer,category:req.body.category},{new:true})
       
       res.redirect('/admin/loadOffer')
    }catch(error)
    {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
            
            const categoryData =await Category.find()
            res.render('page-offers',{category:categoryData,message:"Offer already exists."});
        }
        else{
        console.log(error.message);
            }
    }
}

// // to delete offer


const deleteOffer = async (req, res) => {
    try {
        const id = req.query.id;

        // Find the offer associated with the provided ID
        const offer = await Offer.findById(id);
        if (!offer) {
            return res.status(404).send("Offer not found");
        }

        // Delete the offer
        await Offer.findByIdAndDelete(id);

        Product.find({ 'category.name': offer.category })
            .then(async products => {
                for (const product of products) {
                    product.offer = false;
                    product.price = product.originalPrice;
                    product.offerPercentage = "nill";
                    await product.save();
                    console.log("Modified product:", product);
                }
                res.redirect("/admin/loadOffer");
            })
            .catch(error => {
                console.error('Error finding products:', error);
                res.status(500).send("Internal Server Error");
            });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};





module.exports={
    loadLogin,
    verifyLogin,
    logout,
    loadDash,


    loadProduct,
    productAddPage,
    addProduct,
    productEdit,
    updateProduct,
    unlistProduct,
    unlisted,
    toList,


    loadCategory,
    addCategory,
    categoryEdit,
    updateCategory,
    unlistCategory,
    listCategory,
    loadUnlistedCategories,


    loadUser,
    blockUser,
    unBlock,

    orders,
    loadOrderDetails,
    cancelOrder,
    deliverOrder,
    reverseOrders,
    deliverWholeOrder,

    loadCoupon,
    addCoupon,
    couponEdit,
    updateCoupon,
    deleteCoupon,

    loadOffers,
    addOffer,
    deleteOffer,
    editOffer,
    updateOffer,
    deliveredOrders,
    approveReturn

}