const mongoose = require('mongoose');
const { Schema} = mongoose;


// this is for the pool card

const poolsubSchema = new Schema({
  title: String,
  descriptions: String
});

module.exports = mongoose.model('poolsubcard', poolsubSchema);
//change model name from subcards
