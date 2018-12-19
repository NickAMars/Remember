const User = require('../models/User');
const MasterCard = require('../models/MasterCards');
const SubCard = require('../models/SubCards');
const passport        = require('passport');
module.exports = {
  masterCards : (req,res) =>{
    console.log("show all master cards ");
    res.send("All master cards");
  },
  createMasterCards : async (req,res) =>{
    // console.log("create one master card");
    const {title, cards } = req.body;
    // console.log(req.user);
    console.log(title);
    const findUser = await User.findById(req.user);
    const newMaster = new MasterCard({title });
    findUser.mastercards.push(newMaster);
    cards.forEach(card => {
        const newSub = new SubCard({title: card.title,   descriptions: card.description });
        newMaster.subcards.push(newSub);
        newSub.save();
    });
    newMaster.user = findUser;
    // add all sub cards
    Promise.all([findUser.save(), newMaster.save()]);
    // // findUser.save();

    // place all the card information here
    // createMaster.subcards.push()

    res.send("create one master card" );
  },
  updateMasterCards : (req,res) =>{
    //Would have to update from the users side


   //  {cards:
   //  [ { id: '3932d1c0-02ec-11e9-ab5f-adce0c5467bf',
   //      title: 'sdf',
   //      description: 'dsfd',
   //      firstRender: true } ],
   // title: { title: 'I love what i do' }
    res.send("update a master card");
  },
  deleteMasterCards : (req,res) =>{
    console.log("delete a master card "+ req.params.id);
    res.send("delete a master card");
  }
};


// CRUD
