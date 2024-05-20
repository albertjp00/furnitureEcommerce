const ordered = async(req,res)=>{
    try {
        console.log(req.body);
        const userId = req.session.user_id;
        const total = req.query.total
        console.log("totallll"+total);
        console.log(typeof req.body.paymentMethod);
       
        const cartItems = await Cart.findOne({ userId: userId });

        if(!cartItems){

        const orderItem = new Order({
            userId: userId,
            products: [], 
            totalAmount:total,
            addressId: req.body.address, 
            paymentmethod:req.body.paymentMethod
        });


        // adding placed order to ordersModel
        console.log(userId);
        for (const cartProduct of cartItems.products) {
            const productDetails = await Product.findById(cartProduct.productId); 
            if (productDetails) {
               
                orderItem.products.push({
                    productId: cartProduct.productId,
                    quantity: cartProduct.quantity,
                });
            }
        }
    }else{
        for (const cartProduct of cartItems.products) {
            const productDetails = await Product.findById(cartProduct.productId); 
            if (productDetails) {
               
                orderItem.products.push({
                    productId: cartProduct.productId,
                    quantity: cartProduct.quantity,
                });
            }
        }
    }

        const savedOrderItem = await orderItem.save();

        // to add productId into myOrders model
                const existingOrder = await myOrder.findOne({ userId: userId });

                if (!existingOrder) {
                    // If no existing order, create a new one
                    const newOrder = new myOrder({
                        userId: userId,
                        products: [] // Initialize products array
                    });

                    // Push productId into the products array
                    for (const cartProduct of cartItems.products) {
                        const productDetails = await Product.findById(cartProduct.productId); 
                        if (productDetails) {
                            newOrder.products.push({
                                productId: cartProduct.productId,
                            });
                        }
                    }

                    // Save the new order document
                    await newOrder.save();
                } else {
                    // If an existing order is found, simply push productId into its products array
                    for (const cartProduct of cartItems.products) {
                        const productDetails = await Product.findById(cartProduct.productId); 
                        if (productDetails) {
                            existingOrder.products.push({
                                productId: cartProduct.productId,
                            });
                        }
                    }

                    // Save the updated order document
                    await existingOrder.save();
                }

        console.log("MyorderItem");

       


        res.redirect('/user/orders');
    } catch(error) {
        console.log(error.message);
        res.status(500).send("Error in placing order");
    }
}


//to load My orders page 

const loadOrders = async (req, res) => {
    try {
        console.log("Inside loadOrders");
        const userId = req.session.user_id; 

        const details = await Order.findOne({userId:userId})
        
        let productDetails=[]
        for(let proId of details.products)
        {
            productDetails.push(proId)
        }

        console.log("iddddd"+productDetails);

        console.log("detailsssssss:",ordersWithProductDetails);

        // Delete items from cart
        const cartDelete = await Cart.findOne({ userId: userId });
        if (cartDelete) {
            await Cart.findByIdAndDelete(cartDelete._id);
        }
        
        res.render('orders', { product: ordersWithProductDetails }); 


    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error"); // Handle error appropriately
    }
};