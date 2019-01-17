const authController      = require(`../controllers/authController`);
const passport        = require('passport');



// need middleware to check if the user is already sign in
module.exports = app => {

  // File for out or signing up existing user
  app.post('/auth/signup', authController.signup);

  //click sign up button check information send back
  app.post('/auth/login', authController.login);

  // app.post('/auth/google/callback',Controller.local);
  app.get('/auth/google', authController.google);
  app.get('/auth/google/callback', passport.authenticate('google'),authController.googleCB);
  app.get('/auth/facebook', authController.facebook);
  app.get('/auth/facebook/callback', passport.authenticate('facebook'), authController.facebookCB);
  app.get('/api/logout', authController.logout);
}

/*
problem is the both of the route sign in the user need to go over the authenication again
no submition today
*/



// app.post('/auth/signup',passport.authenticate('local'));
//
// //click sign up button check information send back
// app.post('/auth/login',authController.login);
