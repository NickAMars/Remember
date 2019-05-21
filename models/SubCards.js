const mongoose = require('mongoose');
const { Schema} = mongoose;

const subCardSchema = new Schema({
  title: String,
  descriptions: String
});

module.exports = mongoose.model('subcards', subCardSchema);
//change model name from subcards
