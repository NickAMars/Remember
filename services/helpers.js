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
helpers.previousEight = function(){// Date
  const TOTAL_DAYS = 8;
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

  const MAX_LENGTH = 8;

  // Day that should be in
  furthestDay = default_arr[0];// - 4*(1000 *  60 * 60 * 24);
  // removing from the front of the array the once that are less than expected value
  for(let i = 0; i < mongo_arr.length; i++){
    // remove anthing that lower than the expected date
    if(furthestDay > Number(mongo_arr[i].daycreated)){
      mongo_arr.shift();
      // remove the first element until we have a value that is greater than
      // mongo_arr.shift();
      i--;
    }
  }

  let merge = [];
  let i=0, j=0;
  while(j< MAX_LENGTH- 1){
    console.log("length : i ",mongo_arr.length , i)
    if(mongo_arr.length > i &&
      Number( mongo_arr[i].daycreated ) >= default_arr[j]  &&
      Number( mongo_arr[i].daycreated ) <= default_arr[j+1] ){
        merge.push(mongo_arr[i]);

        i++;
    }else{
      merge.push({ daycreated: default_arr[j], time: 0});
    }

    j++;
  }
  console.log(merge);
  // console.log(merge);
// console.log("Function Ended");
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
// only gives back 5 cards in an object array
helpers.TopFiveCard= function(Cards){
  // gets the 5 largest values in that array and return it back
    const masterCards  = Cards.slice(0);
    let max = 0 ;
    let max_Index = 0;
    let card = {};
    let storage = [];
    if( masterCards.length < 5){
      // if we have less that 5 cards
      for(let i = 0 ; i <  masterCards.length; i++){
        storage.push({
          maxTime: masterCards[i].timespent,
          referenceID: masterCards[i]._id.toString(),
          title:masterCards[i].title,
          timestamp: masterCards[i].timestamp});
      }

    }else{
      while(storage.length != 5){
        // Looks for which card has the maximum time spent
        for(let i = 0 ; i < masterCards.length; i++){
          // the equal sign is so that if we have all 0 it wont go on a continous loop
          if(max <= Number(masterCards[i].timespent)){
            max_Index = i;
            max = masterCards[i].timespent;
            card = masterCards[i];
          }
        }// for end
        // remove the card from the list
        masterCards.splice(max_Index,1);
        // puts it in the storage array
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
