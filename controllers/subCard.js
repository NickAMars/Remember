const subCards = require('../models/SubCards');
const passport        = require('passport');
module.exports = {

subCards: (req,res) =>{
  console.log("All sub cards");
  res.send("All sub cards");
},
subCardForm: (req,res) =>{
  console.log("Form for new subCard");
  res.send("Form for new subCard");
},
addsubCard: (req,res) =>{
  console.log("adding new subcard");
  res.send("adding new subcard");
},
changeSubCard: (req,res) =>{
  console.log("changing existing subcard");
  res.send("changing exist subcard");
},
deleteSubCard: (req,res) =>{
  console.log("delete existing subcard");
  res.send("delete existing subcard");
},
storeMultipleSubCards: (req,res)=>{
  console.log("add multiple subcards");
  res.send("add multiple subcards");
}

};
