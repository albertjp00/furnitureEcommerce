const express= require("express")
const admin_route= express()
const fs=require('fs')

const path = require("path")

const session=require("express-session")
const config=require("../config/config")
admin_route.use(session({
    secret:'secret-key',
    resave: false,
    saveUninitialized: true
}));
// const authen = require("../middleware/auth")

const adminController= require("../controller/admincontroller")

// admin_route.set('view engine','ejs')
admin_route.set("views",'./view/admin')

// admin_route.use(express.static("C:/ecommerce/view/admin"))

const staticFilesDirectory = path.join(__dirname, '..', 'view', 'admin');
admin_route.use(express.static(staticFilesDirectory));


// admin_route.use("/static",express.static("C:/project1/view/admin-assets"))
// admin_route.use("/assets",express.static("C:/project1/view/admin"))

const auth=require("../middleware/adminAuth")

const bodyParser= require('body-parser')
admin_route.use(bodyParser.json())
admin_route.use(bodyParser.urlencoded({extended:true}))

const multer=require('../middleware/multer')




// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         const firstdestination  = path.join(__dirname, "../view/admin/productImages")
        
//         cb(null,firstdestination);
//         // cb(null, path.join(__dirname, "../view/user/productImages"));
//         const seconddestination = path.join(__dirname, "../view/user/productImages")
//         fs.promises.mkdir(seconddestination, { recursive: true })
//       .catch(err => console.error('Error creating user destination folder:', err));
        
//     },
//     filename: function(req, file, cb) {
//         const name = Date.now() + "-" + file.originalname;

        
//         cb(null, name);
//         console.log(name+"Image added-multer");

//     }
// });


// const upload = multer({storage:storage})
// const upload = multer({ storage }).array('productImages[]');





admin_route.get('/',auth.islogout,adminController.loadLogin)

admin_route.post('/login',adminController.verifyLogin)

admin_route.get('/dashboard',auth.islogin,adminController.loadDash)

admin_route.get('/logout',adminController.logout)



admin_route.get('/products',auth.islogin,adminController.loadProduct)

admin_route.get('/ProductLoad',auth.islogin,adminController.productAddPage)

admin_route.post('/productAdd',multer.any(),adminController.addProduct)

admin_route.get('/editProduct',adminController.productEdit)

admin_route.post('/editProduct',multer.any(),adminController.updateProduct)

admin_route.get('/unlistProduct',adminController.unlistProduct)

admin_route.get('/listProduct',auth.islogin,adminController.toList)

admin_route.get('/unlisted',auth.islogin,adminController.unlisted)



admin_route.get('/category',auth.islogin,adminController.loadCategory)

admin_route.post('/category',adminController.addCategory)

admin_route.get('/editCategory',adminController.categoryEdit)

admin_route.post('/editCategory',adminController.updateCategory)

admin_route.get('/deleteCategory',auth.islogin,adminController.unlistCategory)

admin_route.get('/listCategory',auth.islogin,adminController.listCategory)

admin_route.get('/unlistedCategories',auth.islogin,adminController.loadUnlistedCategories)



admin_route.get('/getUser',auth.islogin,adminController.loadUser)

admin_route.get('/block',auth.islogin,adminController.blockUser)

admin_route.get('/unblock',auth.islogin,adminController.unBlock)



admin_route.get('/order',auth.islogin,adminController.orders)

admin_route.get('/cancel',auth.islogin,adminController.cancelOrder)

admin_route.get('/deliver',auth.islogin,adminController.deliverOrder)

admin_route.get('/loadDetails',auth.islogin,adminController.loadOrderDetails)

admin_route.get('/deliverWhole',auth.islogin,adminController.deliverWholeOrder)

admin_route.get('/delivered',auth.islogin,adminController.orders)

admin_route.get('/reverseOrderList',auth.islogin,adminController.orders)

admin_route.get('/deliveredOrder',auth.islogin,adminController.deliveredOrders)

admin_route.get('/return',auth.islogin,adminController.approveReturn)






admin_route.get('/coupon',auth.islogin,adminController.loadCoupon)

admin_route.post('/coupon',auth.islogin,adminController.addCoupon)

admin_route.get('/editCoupon',auth.islogin,adminController.couponEdit)

admin_route.post('/editCoupon',auth.islogin,adminController.updateCoupon)

admin_route.get('/deleteCoupon',auth.islogin,adminController.deleteCoupon)



admin_route.get('/loadOffer',auth.islogin,adminController.loadOffers)

admin_route.post('/addOffer',auth.islogin,adminController.addOffer)

admin_route.get('/deleteOffer',auth.islogin,adminController.deleteOffer)

admin_route.get('/editOffer',auth.islogin,adminController.editOffer)

admin_route.post('/editOffer',auth.islogin,adminController.updateOffer)



module.exports=admin_route


