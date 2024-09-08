const jwt = require('jsonwebtoken');

const islogin = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (token) {
            // Verify the token and extract the user ID
            // User is logged in, allow them to proceed
            console.log("User logged in");
        } else {
            // User is not logged in, redirect to login page
            res.redirect('/user/login');
        }
        next();
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Serverrrrrrrrrrrr Error');
    }
};

const islogout = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        

        if (token) {
            // User is logged in, redirect to home page
            console.log('User logged in, redirecting to home');
            return res.redirect('/user/home');
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
};

module.exports={
    islogin,
    islogout
}