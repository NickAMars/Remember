const MasterCard = require('../models/MasterCards');
const SubCard = require('../models/SubCards');
const passport        = require('passport');
module.exports = {

subCards: async (req,res) =>{
  const {id} = req.params;
  const findMaster = await MasterCard.findById(id).populate('subcards');
  if(!findMaster) return res.status(500).send("FAIL TO LOAD CARDS")
  // console.log(findMaster['subcards'])
  // // console.log("All sub cards", id);
  res.send(findMaster['subcards']);
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
