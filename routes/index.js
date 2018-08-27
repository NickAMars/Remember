const Controller = require(`../controllers`);



module.exports = app => {
  // app.post('/test', Controller.test);
  app.get('/profile',Controller.profile);
  app.get('/logout', Controller.logout);
  app.post('/signup',Controller.local);
  app.get('/login',Controller.signUp);
  app.get('*',Controller.wildCard );


}
