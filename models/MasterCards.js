const mongoose = require('mongoose');
const { Schema } = mongoose;

// embedded day practive
const progressSchema = new Schema({
  time: Number,
  daycreated: {type: Date, default: Date.now}
});
/*
daycreated: will be set every day at 12 midnight
time: tracks the time that the user spent on the mastercard
*/

const masterCardSchema = new Schema({
  title: String,
  url: {type: String, default: ""},
  timestamp: {type: Date, default: Date.now},
  subcards: [
   {
     type: mongoose.Schema.Types.ObjectId,
     ref: "subcards"
   }
 ],
 progress: [progressSchema] //embedded resource
});

// count the subcard length
// show on the mastercard how many cards it currently have
masterCardSchema.virtual('countCards').get( function(){
  return this.subcards.length;
});

// delete the master card would trigger this
/*masterCardSchema.pre('remove', async function(next){
  const subCards = mongoose.model('subcards');
  await subCards.remove({ _id: { $in : this.subCards }});
  next();
});
*/
module.exports = mongoose.model('mastercards', masterCardSchema);
/*
  The progress will be set every day at 12 midnight
  setTnterval(function, 86400000)  1000s/ms* 60m/s*60h/m*24day/h
*/
