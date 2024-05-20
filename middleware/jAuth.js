// const jwtAuthMiddleware = (req, res, next) => {
//     const token = req.cookies.token; // Assuming token is stored in cookies

//     if (!token) {
//         return res.status(401).json({ message: 'Unauthorized: Missing token' });
//     }

//     try {
//         const decoded = jwt.verify(token, 'your_secret_key'); // Verify token with your secret key
//         req.userId = decoded.userId; // Attach userId to request object for further processing
//         next();
//     } catch (error) {
//         return res.status(401).json({ message: 'Unauthorized: Invalid token' });
//     }
// };

const jwt = require('jsonwebtoken');

const isLogin = async (req, res, next) => {
    try {
        // Check if token exists in cookies
        // const token = req.cookies.token;

        if (req.cookies.token) {
            // Token exists, verify token
            next()
        } else {
            // Token does not exist, redirect to login
            res.redirect('/user/login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error////////////////');
    }
};

const isLogout = async (req, res, next) => {
    try {
        // Check if token exists in cookies
        // const token = req.cookies.token;
        console.log("cookie"+req.cookies);

        if (req.cookies.token) {
            // Token exists, verify token
            jwt.verify(token, 'your_secret_key', (err, decoded) => {
                if (err) {
                    // Token verification failed, allow user to proceed
                    
                    res.redirect('/user');
                } else {
                    // Token verification successful, redirect to home page
                    
                }
            });
        } else {
            // Token does not exist, allow user to proceed
            next();
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error///////////////');
    }
};

module.exports = {
    isLogin,
    isLogout
};