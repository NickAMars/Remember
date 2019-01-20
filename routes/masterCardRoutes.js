const Controller      = require(`../controllers/masterCard`);
const isLoggedIn    = require("../middleware");

module.exports = app => {
  // get my profile
  app.get('/api/profile/MasterCard', isLoggedIn, Controller.masterCards); // shows your profile page
  // create my profile (doesnt make sence if your the user)
  app.post('/api/profile/MasterCard',isLoggedIn, Controller.createMasterCards);
  // change my profile
  app.put('/api/profile/MasterCard/:id',isLoggedIn, Controller.updateMasterCards);
  // delete my profile
  app.delete('/api/profile/MasterCard/:id',isLoggedIn, Controller.deleteMasterCards);

  app.put('/api/profile/MasterCard/time/:id',isLoggedIn, Controller.timeMasterCards);
}
