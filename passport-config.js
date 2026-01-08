const passport = require('passport');
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/user');

// Local Strategy (existing)
passport.use(new LocalStrategy(User.authenticate()));

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        return done(null, user);
      }
      
      // Check if user exists with same email
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.displayName = profile.displayName;
        user.profilePicture = profile.photos[0]?.value;
        await user.save();
        return done(null, user);
      }
      
      // Create new user
      const newUser = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        username: profile.emails[0].value.split('@')[0] + '_' + Date.now(),
        displayName: profile.displayName,
        profilePicture: profile.photos[0]?.value
      });
      
      await newUser.save();
      done(null, newUser);
    } catch (err) {
      done(err, null);
    }
  }
));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = passport;