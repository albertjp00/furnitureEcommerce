const islogin = async (req, res, next) => {
    try {
        if (req.session.userid) {
            // User is logged in, allow them to proceed
            console.log('islogin middleware', req.session.userid);   
        } else {
            // User is not logged in, redirect to login page
            res.redirect('/admin');
        }
        next()
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};



const islogout = async (req, res, next) => {
    try {
        if (req.session.userid) {
            
            res.redirect('/admin/dashboard')
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
};



module.exports={
    islogin,
    islogout
}