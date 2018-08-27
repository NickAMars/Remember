const User = require('../models/User');
const passport        = require('passport');
module.exports = {
    signUp(req,res){res.send("Signup");},
    profile(req,res){res.send("Profile");},
    logout(req,res){res.send("LogOut");},
    create(req, res){res.send("CREATE POST");},
    wildCard(req, res){ res.send('Wild Card');},
    local: passport.authenticate('local-login', {
          successRedirect : '/profile',
          failureRedirect : '/login'
        })
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
