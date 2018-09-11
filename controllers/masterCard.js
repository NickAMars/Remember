const masterCards = require('../models/MasterCards');
const passport        = require('passport');
module.exports = {
  masterCards : (req,res) =>{
    console.log("show all master cards ");
    res.send("All master cards");
  },
  createMasterCards : (req,res) =>{
    console.log("create one master card");
    res.send("create one master card");
  },
  updateMasterCards : (req,res) =>{
    console.log("update a master card");
    res.send("update a master card");
  },
  deleteMasterCards : (req,res) =>{
    console.log("delete a master card");
    res.send("delete a master card");
  }
};

// CRUD
