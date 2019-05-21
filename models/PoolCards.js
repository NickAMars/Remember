const mongoose = require('mongoose');
const { Schema } = mongoose;

// constain the master cards that went public
const poolSchema = new Schema({
  author: String,
  title: String,
  // description: String,
  timestamp: {type: Date, default: Date.now()},
  subcards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subcards"
    }
 ]
});

poolSchema.pre('remove', async function(next){
  const subCards = mongoose.model('subcards');
  await subCards.deleteMany({ _id : { $in : this.subcards } });
  next();
});

module.exports = mongoose.model('poolcards', poolSchema);
