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
  return new Date(year, month, date);//Date
}

// return an array of the previous 7 days
helpers.previousSix = function(){// Date
  const TOTAL_DAYS = 6;
  const current_date = this.currentDate(new Date());
  const prevDays= [];
// second min hours day
 let lastday; //=   Number(current_date) + (1000 *  60 * 60 * 24);
for(let i = TOTAL_DAYS; i > 0; i--){
  lastday = Number(current_date) - i*(1000 *  60 * 60 * 24);
  prevDays.push(Number(new Date(lastday)));
}
// prevDays.push(Number(new Date(current_date)));

return prevDays;
}

helpers.mixdate = function(default_arr , mongo_arr){
  const MAX_LENGTH = 7;
  // Day that should be in
  furthestDay = default_arr[0];// - 4*(1000 *  60 * 60 * 24);

  for(let i = 0; i < mongo_arr.length; i++){
    if(furthestDay > mongo_arr[i].daycreated){
      // remove the first element until we have a value that is greater than
      mongo_arr.shift();
      i--;
    }
  }

  let merge = [];
  let i=0, j=0;

  while(j< 6){
    if(mongo_arr[i].daycreated == default_arr[j]){
      merge.push(mongo_arr[i]);
    i++;
    }else if(mongo_arr[i].daycreated > default_arr[j]){
      merge.push({ daycreated: default_arr[j], time: 0});
    }
    j++;
  }

  return merge;

}
// adds everthing up and store the final value in mongodb
helpers.calculateTimeSpent= function(mongo_arr){
    let timeSpent = 0;
    mongo_arr.forEach(elem => {
      timeSpent += elem.time;
    });
    return timeSpent;
}
helpers.TopFiveCard= function(masterCards){
  // gets the 5 largest values in that array and return it back

    let max = 0 ;
    let max_Index = 0;
    let card = {};
    let storage = [];
    if( masterCards.length < 5){
      for(let i = 0 ; i <  masterCards.length; i++){
        storage.push({
          maxTime: masterCards[i].timespent,
          referenceID: masterCards[i]._id.toString(),
          title:masterCards[i].title,
          timestamp: masterCards[i].timestamp});
      }
    }else{
      while(storage.length != 5){
        for(let i = 0 ; i < masterCards.length; i++){
          if(max < masterCards[i].timespent){
            max_Index = i;
            max = masterCards[i].timespent;
            card = masterCards[i];
          }
        }
        masterCards.splice(max_Index,1);
        storage.push({
          maxTime: max,
          referenceID: card._id.toString(),
          title:card.title,
          timestamp: card.timestamp});
        max =0;
      }
    }



    return storage;
}

module.exports = helpers;
