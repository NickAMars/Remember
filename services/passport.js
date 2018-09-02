const passport          = require('passport');
const mongoose          = require('mongoose');
const helpers           = require('./helpers');
const keys              = require('../config/keys');
const uuidv4            = require('uuid/v4');
const LocalStrategy     = require('passport-local').Strategy;
const GoogleStategy     = require('passport-google-oauth20').Strategy;
const FacebookStrategy  = require('passport-facebook').Strategy;
// model class
const User = mongoose.model('users');

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) =>{
  User.findById( id ).then(user => {
    done(null, user)
  });
});

/*
  User id doesnt change,name can change, password can change
*/


passport.use('local-login', new LocalStrategy({
        usernameField  : 'name',
        passwordField  : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    async (req, name, password, done) => {
          const hash = await helpers.hash(password);
          const existingUser = await User.findOne({ 'name':  name, password: hash});
          if(existingUser)
            return done(null, existingUser);
          // generate a random id
          const newUser = new User({Id: uuidv4(), name: name, password: hash });
          await newUser.save();
          return done(null, newUser);
    })
  );

passport.use(
  new GoogleStategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: '/auth/google/callback',
    proxy:true
  },
    async (accessToken, refreshToken, profile, done) => {
      const existingUser= await  User.findOne({ Id : profile.id });
      if(existingUser)// does the id already exist
        return done(null, existingUser);
      const newUser =  new User({ Id: profile.id });
      await newUser.save()
      return done(null, newUser);
  })
);

passport.use(new FacebookStrategy({
      clientID        : keys.FBClientID,
      clientSecret    : keys.FBClientSecret,
      callbackURL     : '/auth/facebook/callback',
      proxy:true
  },
  async (accessToken, refreshToken, profile, done) => {
    const existingUser= await  User.findOne({ Id : profile.id });
    if(existingUser)// does the id already exist
      return done(null, existingUser);
    const newUser =  new User({ Id: profile.id });
    await newUser.save()
    return done(null, newUser);
  })
);
