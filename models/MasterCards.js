const mongoose = require('mongoose');
const { Schema } = mongoose;
const User = require('./User');
// embedded day practive
const progressSchema = new Schema({
  time: Number,
  daycreated: {type: Date, default: Date.now()}
});


const masterCardSchema = new Schema({
  title: String,
  url: {type: String, default: ""},
  timestamp: {type: Date, default: Date.now()},
  subcards: [
   {
     type: mongoose.Schema.Types.ObjectId,
     ref: "subcards"
   }
 ],
 progress: [progressSchema],
 user:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
 },
 timespent: {type: Number , default: 0}
});

// count the subcard length
// show on the mastercard how many cards it currently have
masterCardSchema.virtual('countCards').get( function(){
  return this.subcards.length;
});
// gets the time spent
// masterCardSchema.virtual('calculateTimeSpent').get( function(){
//   let timeSpent = 0;
//   this.progress.forEach(elem => {
//     timeSpent += elem.time;
//   });
//   return timeSpent;
// });

// Make sure i delete a model instance when getting to this
masterCardSchema.pre('remove', async function(next){
  // this is the reference to the master
  // $in -- go through all the subcards and look at there id
  const subCards = mongoose.model('subcards');
  // go through all the subCards, look at all the sub cards
  await subCards.deleteMany({ _id : { $in : this.subcards } });

// get the user and remove the The top five card if it is in there
  const findUser = await User.findById(this.user);
  const topfive_length =await findUser.topfiveMaster.length;
  if(topfive_length > 0 ){
    let index = findUser.topfiveMaster.findIndex(topfive => topfive.referenceID === this._id.toString());
    if(index > 0 ){
      findUser.topfiveMaster.splice(index, index+1);
    }
  }
  await findUser.save();
  next();
});

module.exports = mongoose.model('mastercards', masterCardSchema);


/*
progressSchema
daycreated: will be set every day at 12 midnight
time: tracks the time that the user spent on the mastercard

The progress will be set every day at 12 midnight
setTnterval(function, 86400000)  1000s/ms* 60m/s*60h/m*24day/h
*/
