const User = require('../models/User');
const passport        = require('passport');
module.exports = {
    // req.user doesnt updata as efficiently as i thought
    profile : async(req,res,next) =>{
      const findUser = await User.findById(req.user._id);
      if(findUser)
        res.send(findUser);
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
