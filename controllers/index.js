const User = require('../models/User');
const passport        = require('passport');
module.exports = {
    // signUp(req,res){res.send("Signup");},
    profile : (req,res) => res.send(req.user) ,
    create: (req, res)=>res.send("CREATE POST")
}































// // TEST CASE
// async test(req,res,next){
//   try{
//     const newUser = await User.create(req.body);
//     res.send(newUser);
//   }catch(err){
//     next(err);
//   }
// },
