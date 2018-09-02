const Controller      = require(`../controllers`);
const authController      = require(`../controllers/authController`);
const passport        = require('passport');


module.exports = app => {
  // app.post('/test', Controller.test);
  app.get('/profile',Controller.profile);

  // File for out or signing up existing user
  app.post('/signup',authController.signup);
  app.post('/login',passport.authenticate('local-login'),authController.login);
  // app.post('/auth/google/callback',Controller.local);
  app.get('/auth/google',authController.google);
  app.get('/auth/google/callback',passport.authenticate('google'),authController.googleCB);
  app.get('/auth/facebook',authController.facebook);
  app.get('/auth/facebook/callback',passport.authenticate('facebook'), authController.facebookCB);
  app.get('/logout', authController.logout);


}
