const Controller      = require(`../controllers`);


module.exports = app => {
  // get my profile
  app.get('/api/profile',Controller.profile); // shows your profile page
  // change my profile
  app.put('/api/profile/:id',Controller.update );
  // delete my profile
  app.delete('/api/profile/:id',Controller.delete );
}


/*
 authentication already takes care of this
 app.post('/api/profile',Controller.create );
*/
