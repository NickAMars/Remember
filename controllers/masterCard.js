const User = require('../models/User');
const MasterCard = require('../models/MasterCards');
const SubCard = require('../models/SubCards');
const passport        = require('passport');
module.exports = {
  masterCards : async (req,res) =>{
      const findUser = await User.findById(req.user).populate('mastercards');
      if(!findUser) res.status(500).send({});
      res.send(findUser.mastercards);
  },
  createMasterCards : async (req,res) =>{
    // console.log("create one master card");
    const {title, cards } = req.body;
    const findUser = await User.findById(req.user);
    const newMaster = new MasterCard({title });
    findUser.mastercards.push(newMaster);
    cards.forEach(card => {
        const newSub = new SubCard({title: card.title,   descriptions: card.description });
        newMaster.subcards.push(newSub);
        newSub.save();
    });
    newMaster.user = findUser;
    Promise.all([findUser.save(), newMaster.save()]);

    res.send("create one master card" );
  },
  updateMasterCards :async  (req,res) =>{

    // res.status(400).send("Nothing Was Sent to update")
    if(!req.body.title) return;
    const {title,date} =  req.body;
    const _id = req.params.id;
    const findMaster = await MasterCard.findById(_id);
    if(!findMaster)
      return res.status(500).send("Couldnt find Master Card Information");
      findMaster.title = title;
      findMaster.timestamp = date;
      findMaster.save()
      .catch(err=> res.status(500).send("Couldnt save Master Cards"));

    res.send(findMaster);
  },
  deleteMasterCards : (req,res) =>{
    console.log("delete a master card "+ req.params.id);
    res.send("delete a master card");
  }
};


// CRUD
