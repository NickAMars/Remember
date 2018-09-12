const User = require('../models/User');
const passport        = require('passport');
module.exports = {
    // signUp(req,res){res.send("Signup");},
    profile : async(req,res) =>{
      console.log("Profile");
      res.send("Profile");
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

// test case for seeing people in the database
// const Nick = new User({ code: '7777', name: "Nick", password:"Marsden"});
// await Nick.save();
// Nick["mastercards"].push({title:"Node.js", url:"Picture here"})
// await Nick.save();
// console.log(Nick);
// res.send("CHANGE USER INFORMATION");
