const express= require("express")
const admin_route= express()
const fs=require('fs')



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

admin_route.use(express.static("C:/project1/view/admin"))


// admin_route.use("/static",express.static("C:/project1/view/admin-assets"))
// admin_route.use("/assets",express.static("C:/project1/view/admin"))

const auth=require("../middleware/adminAuth")

const bodyParser= require('body-parser')
admin_route.use(bodyParser.json())
admin_route.use(bodyParser.urlencoded({extended:true}))

const multer=require('../middleware/multer')
const path=require('path')



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





admin_route.get('/',adminController.loadLogin)

admin_route.post('/login',adminController.verifyLogin)

admin_route.get('/dashboard',adminController.loadDash)

admin_route.get('/logout',adminController.logout)

admin_route.get('/products',adminController.loadProduct)

admin_route.get('/ProductLoad',adminController.productAddPage)

admin_route.post('/productadd',multer.any(),adminController.addProduct)

admin_route.get('/editProduct',adminController.productEdit)

admin_route.post('/editProduct',adminController.updateProduct)

admin_route.get('/deleteProduct',adminController.deleteProduct)

admin_route.get('/unlisted',adminController.unlisted)

admin_route.get('/listProduct',adminController.toList)

admin_route.get('/category',adminController.loadCategory)

admin_route.post('/category',adminController.addCategory)

admin_route.get('/editCategory',adminController.categoryEdit)

admin_route.post('/editCategory',adminController.updateCategory)

admin_route.get('/deleteCategory',adminController.deleteCategory)

admin_route.get('/getUser',adminController.loadUser)

admin_route.get('/block',adminController.blockUser)

admin_route.get('/unblock',adminController.unBlock)

admin_route.get('/order',adminController.orders)

admin_route.get('/cancel',adminController.cancelOrder)

module.exports=admin_route


