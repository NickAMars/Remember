const Controller      = require(`../controllers/subCard`);


module.exports = app => {
  // View master card sub cards
  app.get('/api/profile/MasterCard/:id',Controller.subCards);
  // form to add new sub card for existing master card
  app.get('/api/profile/MasterCard/:id/form',Controller.subCardForm);
  // add new sub card to existing master card
  app.post('/api/profile/MasterCard/:id/form',Controller.addsubCard);
    // update sub card existing subcard in master card
    //(need the id of the master as well as the sub card to do this)
    // also need a input field for this application
  app.put('/api/profile/MasterCard/:id_master/:id_sub/form', Controller.changeSubCard);
  //remove sub card
  app.delete('/api/profile/MasterCard/:id_master/:id_sub',Controller.deleteSubCard );


/*  Bellow here is when we are creating the master card and  then input all the sub card then submit*/
  // store all sub cards inital sub cards
  app.post('/api/profile/MasterCard/:id',Controller.storeMultipleSubCards);
}
