var GoogleStrategy = require("passport-google-oauth2").Strategy;
require("dotenv").config();
const passport = require("passport");
const { User } = require("../model/company");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        const user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          const newUser = new User({
            _id: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          });

          await newUser.save();
          return done(null, newUser);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);
