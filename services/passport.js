const passport          = require('passport');
const mongoose          = require('mongoose');
const helpers           = require('./helpers');
const keys              = require('../config/keys');

const LocalStrategy     = require('passport-local').Strategy;
const GoogleStategy     = require('passport-google-oauth20').Strategy;
const FacebookStrategy  = require('passport-facebook').Strategy;
// model class
const User = mongoose.model('users');

module.exports = (passport) => {

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
  passport.use(new LocalStrategy(
      async ( username, password, done) => {
          const user= await User.findOne({ 'name' :  username });
            if(!user)
              return done(null, false, { message: 'Incorrect username.' });
            else if (user.password !==  helpers.hash(password))
              return done(null, false, { message: 'Incorrect password.' });
            else{
              // console.log("user is log in ")
                return done(null, user);
            }
          })
        );




  // proxy:true tells google to trust the url
  passport.use(
    new GoogleStategy({
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy:true
    },
      async (accessToken, refreshToken, profile, done) => {
        const existingUser= await  User.findOne({ code : profile.id });
        if(existingUser)// does the id already exist
          return done(null, existingUser);
        const newUser =  new User({ code: profile.id });
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
      const existingUser= await  User.findOne({ code : profile.id });
      if(existingUser)// does the id already exist
        return done(null, existingUser);
      const newUser =  new User({ code: profile.id });
      await newUser.save()
      return done(null, newUser);
    })
  );

  /*

  from the bellow function we can access the user email from profile argument
    async (accessToken, refreshToken, profile, done) => {}

  */

}
