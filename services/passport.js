const passport         = require('passport');
const keys             = require('../config/keys');
const mongoose         = require('mongoose');
const LocalStrategy    = require('passport-local').Strategy;

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



// log in strategy works 
passport.use('local-login', new LocalStrategy({
        usernameField  : 'name',
        passwordField  : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    (req, name, password, done) => {

          console.log('name', name);
          console.log('password', password);


          User.findOne({ 'name':  name })
          .then(existingUser => {
             if(existingUser)   // does the id already exist
               return done(null, existingUser);
               new User({ name: name, password: generateHash(password) })
               .save()
               .then(user => done(null, user));

           });
    })
  );
