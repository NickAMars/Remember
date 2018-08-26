const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  Id: String,
  name: String,
  password: String
});

module.exports = mongoose.model('users', userSchema);
