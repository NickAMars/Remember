const User = require('../models/User');
const passport        = require('passport');
module.exports = {
    // signUp(req,res){res.send("Signup");},
    profile : async(req,res) =>{
      res.send(req.user);
    },
  /* UPDATE */
    update: async (req,res) =>{
      console.log("update");
      res.send("update");
    },/* DELETE */
    delete: async (req,res) =>{
      console.log("delete");
      res.send("delete");
     }
}
