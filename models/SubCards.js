const mongoose = require('mongoose');
const { Schema} = mongoose;

const subCardSchema = new Schema({
  title: String,
  descriptions: String,
  user:{
       type: mongoose.Schema.Types.ObjectId,
       ref: "users"
  }
});

module.exports = mongoose.model('subcards', subCardSchema);
