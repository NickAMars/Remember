const User = require('../models/User');
const MasterCard = require('../models/MasterCards');
const SubCard = require('../models/SubCards');
const helper = require('../services/helpers');
const passport        = require('passport');
module.exports = {

  masterCard : async (req,res, next) =>{
    const findMaster = await MasterCard.findById(req.params.id).populate('subcards');
      // console.log(findMaster);
    if(!findMaster) return next();

    // console.log(findMaster.progress);
    res.send(findMaster);
  },
  masterCards : async (req,res, next) =>{
      const findUser = await User.findById(req.user).populate(
        {path:'mastercards',
          populate:{
            path: "subcards",
            model: "subcards"
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
    cards.forEach( async card => {
        const newSub = new SubCard({title: card.title,   descriptions: card.description });
        newMaster.subcards.push(newSub);
      await  newSub.save();
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
    let prevSix;
    // takes the current time and look on the last time
    const daycreated = helper.currentDate(new Date()); // return date
    // {$inc: { postCount: 2}}
    // console.log(length);
    if(length === 0 ){ // if the current array is empty
      //INITIALIZING SEVEN PLACES
      // put a value inside your previous days
      prevSix = helper.previousSix();
      for(let i = 0; i< prevSix.length; i++){
        findMaster.progress.push({time:0, daycreated:prevSix[i] });
      }
      findMaster.progress.push({time, daycreated });
 // if its equal to the current date
    }else if(Number(findMaster.progress[length-1].daycreated) === Number(daycreated)){
      //IF LAST ELEMENT IS THE SAME AS THE CURRENT DATE
      // update the time
      findMaster.progress[length-1].time += time;
    }else{ // time, date


      findMaster.progress = helper.mixdate(helper.previousSix() , findMaster.progress);
      // put at the back of stack the newest one
      findMaster.progress.push({time, daycreated });
      // console.log(findMaster.progress)
    }
    findMaster.timespent = helper.calculateTimeSpent(findMaster.progress);
    // just incase we have a overlap of data
    if(findMaster.progress.length > 8) while(findMaster.progress.length > 8) findMaster.progress.shift();
    // console.log(handler.calculateTimeSpent(findMaster.progress));
    await findMaster.save();
    const findUser = await User.findById(req.user).populate('mastercards');
    if(!findUser) next();//res.status(500).send({});
    //send all the master cards back for the users

 // get all the user master card
    findUser.topfiveMaster = helper.TopFiveCard(findUser.mastercards);
    await findUser.save();
    // req.user = findUser;
    // console.log(req.user)
    res.send(findUser.mastercards);
  }
};
