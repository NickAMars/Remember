const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  Id: String,
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
module.exports = mongoose.model('users', userSchema);

/*
  user should have 5 top cards
  that show up on the main screen of the user

  // later when i set up everything first
  topFive: [ // keeps track of the cards with the most
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mastercards"
    }
  ]
*/
