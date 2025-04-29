const passport = require("passport");
const express = require("express");
const session = require("express-session");
const auth = require('../authapi2');

const user_route = express();

user_route.use(session({ secret: "cats" }));
user_route.use(passport.initialize());
user_route.use(passport.session());

user_route.get('/', (req, res) => {
    res.send('<a href="/user/auth/google">Authenticate with Google</a>');
});

user_route.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })
);

user_route.get('/google/callback',
    passport.authenticate('google', {
        successRedirect: '/user/protected',
        failureRedirect: '/user/auth/failure',
    })
);

user_route.get('/auth/failure', (req, res) => {
    res.send('something went wrong..');
});

user_route.get('/protected', isLoggedIn, (req, res) => {
    res.send(`Hello ${req.user.displayName}`);
    // res.redirect('/user/home')
});

user_route.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            console.error(err);
            return res.sendStatus(500); // Internal Server Error
        }
        req.session.destroy();
        res.redirect('/user');
    });
});

// Assuming userRoute is the express.Router() for your user routes
app.use('/user', userRoute);

// ... (your other routes)

app.listen(3000, () => {
    console.log("started");
});
