const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  code: String,
  name: String,
  password: String,
  mastercards: [
   {
     type: mongoose.Schema.Types.ObjectId,
     ref: "mastercards"
   }
 ]
});
// count the master card the user has
userSchema.virtual('countCards').get( function(){
  return this.mastercards.length;
});

userSchema.pre('remove', async function(next){
  // $in - querys
  // remove all sub cards related to user
    // const SubCards = mongoose.model('subcards');
    await mongoose.model('subcards').remove({ user: { $in : this } });
  // remove all the masterCards associated with this user
  // const MasterCards = mongoose.model('mastercards');
  await mongoose.model('mastercards').remove({ _id: { $in : this.mastercards } });
  next();
});

module.exports = mongoose.model('users', userSchema);
