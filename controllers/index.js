const User = require('../models/User');
const passport        = require('passport');
module.exports = {
    // signUp(req,res){res.send("Signup");},
    profile : async(req,res,next) =>{
      // console.log(req.user);
      if(req.user)
        res.send(req.user);
      else
        next();
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
