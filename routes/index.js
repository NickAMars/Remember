const Controller      = require(`../controllers`);
const passport        = require('passport');


module.exports = app => {
  // app.post('/test', Controller.test);
  app.get('/profile',Controller.profile);

  // File for out or signing up existing user
  app.post('/signup',Controller.signup);
  app.post('/login',passport.authenticate('local-login'),Controller.login);
  // app.post('/auth/google/callback',Controller.local);
  app.get('/auth/google',Controller.google);
  app.get('/auth/google/callback',passport.authenticate('google'),Controller.googleCB);
  app.get('/auth/facebook',Controller.facebook);
  app.get('/auth/facebook/callback',passport.authenticate('facebook'), Controller.facebookCB);
  app.get('/logout', Controller.logout);


}
