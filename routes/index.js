const Controller      = require(`../controllers`);
const isLoggedIn    = require("../middleware");


module.exports = app => {
  // get my profile id
  app.get('/api/profile',Controller.profile);
  // change my profile
  app.put('/api/profile/:id',isLoggedIn, Controller.update );
  // delete my profile
  app.delete('/api/profile/:id',isLoggedIn, Controller.delete );
}
