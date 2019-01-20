const mongoose = require('mongoose');
const { Schema } = mongoose;

// constain the master cards that went public
const poolSchema = new Schema({
  author: String,
  title: String,
  description: String,
  timestamp: Date
});

/*
Compare the author with the code
  add a master card to the pool
  Allow the author to delete and update this card in the pool
*/
