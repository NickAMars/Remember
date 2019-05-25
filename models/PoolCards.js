const mongoose = require('mongoose');
const { Schema } = mongoose;

// constain the master cards that went public
const poolSchema = new Schema({
  // person who wrote the card can delete  this
  author: String,
  title: String,
  // description: String,
  timestamp: {type: Date, default: Date.now()},
  subcards: [
   {
     type: mongoose.Schema.Types.ObjectId,
     ref: "poolsubcard"
   }
 ]
});

poolSchema.pre('remove', async function(next){
  const poolsubCards = mongoose.model('poolsubcard');
  await poolsubCards.deleteMany({ _id : { $in : this.subcards } });
  next();
});

module.exports = mongoose.model('poolcards', poolSchema);
