const Controller      = require(`../controllers/masterCard`);


module.exports = app => {
  // get my profile
  app.get('/api/profile/MasterCard',Controller.masterCards); // shows your profile page
  // create my profile (doesnt make sence if your the user)
  app.post('/api/profile/MasterCard',Controller.createMasterCards);
  // change my profile
  app.put('/api/profile/MasterCard/:id',Controller.updateMasterCards);
  // delete my profile
  app.delete('/api/profile/MasterCard/:id', Controller.deleteMasterCards);
}
