const passport = require("passport")

const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

const GOOGLE_CLIENT_ID = '310531477100-qa8g7vvom447smud8bico4bhuf5lkbpq.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = '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'

passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/user/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    
      return done(null, profile);
    
  }
));


passport.serializeUser(function(user,done){
    done(null,user)
})

passport.deserializeUser(function(user,done){
    done(null,user)
})