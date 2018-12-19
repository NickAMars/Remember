const Controller      = require(`../controllers`);


module.exports = app => {
  // get my profile id
  app.get('/api/profile',Controller.profile);
  // change my profile
  app.put('/api/profile/:id',Controller.update );
  // delete my profile
  app.delete('/api/profile/:id',Controller.delete );
}
