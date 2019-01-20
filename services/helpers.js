const crypto           = require('crypto');
const keys             = require('../config/keys');


const helpers ={};

helpers.hash = function(password){
  return crypto.createHmac('sha256',  keys.hashKey).update(password).digest('hex');
}
helpers.currentDate = function(current){// Date
  // const current = new Date();
  const year = current.getFullYear();
  const date = current.getDate();
  const month= current.getMonth();
  return new Date(year, date, month);//Date
}

module.exports = helpers;
