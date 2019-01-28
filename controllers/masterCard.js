const User = require('../models/User');
const MasterCard = require('../models/MasterCards');
const SubCard = require('../models/SubCards');
const helper = require('../services/helpers');
const passport        = require('passport');
module.exports = {
  masterCards : async (req,res, next) =>{
      const findUser = await User.findById(req.user).populate(
        {path:'mastercards',
          populate:{
            path: "subcards",
            model: "subcard"
          }
        });
      if(!findUser) next();//res.status(500).send({});
      res.send(findUser.mastercards);
  },
  createMasterCards : async (req,res) =>{
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
    await Promise.all([findUser.save(), newMaster.save()]);
    res.redirect('/api/profile/MasterCard');
  },
  updateMasterCards :async  (req,res,next) =>{

    // res.status(400).send("Nothing Was Sent to update")
    if(!req.body.title) return;
    const {title,date} =  req.body;
    // const _id = req.params.id;
    const findMaster = await MasterCard.findById(req.params.id);
    if(!findMaster)
      return next();//res.status(500).send("Couldnt find Master Card Information");
      findMaster.title = title;
      findMaster.timestamp = date;
      findMaster.save()
      .catch(err=> res.status(500).send("Couldnt save Master Cards"));
    res.send(findMaster);
  },
  deleteMasterCards : async (req,res) =>{
    const mastercard = await MasterCard.findById(req.params.id);
    await mastercard.remove();
    res.send("SUCCESSFUL DELETE");
  },
  timeMasterCards : async (req, res, next) => {
    // updating information
    const findMaster = await MasterCard.findById(req.params.id);
    const length = findMaster.progress.length;
    const time = req.body.time;
    // takes the current time and look on the last time
    const daycreated = helper.currentDate(new Date()); // return date
    // {$inc: { postCount: 2}}
    if(length === 0 ){ // if empty
      findMaster.progress.push({time, daycreated });
    }else if(findMaster.progress[length-1].daycreated.getTime() === daycreated.getTime()){
      // update the time
      findMaster.progress[length-1].time += time;
    }else{ // time, date
      findMaster.progress.push({time, daycreated });
      // if the new length is 8 remove the first element
      if(findMaster.progress.length > 7){
        findMaster.progress.shift();
      }
    }
    await findMaster.save();
    const findUser = await User.findById(req.user).populate('mastercards');
    if(!findUser) next();//res.status(500).send({});
    //send all the master cards back for the users
    res.send(findUser.mastercards);
  }
};
