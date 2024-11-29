const googleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
require("dotenv").config();

// Google OAuth strategy configuration
passport.use(
  new googleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/callback",
      scope: ["email", "profile"],
    },
    function (accessToken, refreshToken, profile, callback) {
      console.log(profile);
      callback(null, profile);
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
