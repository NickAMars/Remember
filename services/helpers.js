const crypto           = require('crypto');
const keys             = require('../config/keys');


const helpers ={};

helpers.hash = function(password){
  return crypto.createHmac('sha256',  keys.hashKey).update(password).digest('hex');
}


module.exports = helpers;
