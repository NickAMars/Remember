const User = require('../models/User');
const passport        = require('passport');
module.exports = {
    // signUp(req,res){res.send("Signup");},
    profile : (req,res) => res.send(req.user) ,

    create: (req, res)=>res.send("CREATE POST"),
    signup:       passport.authenticate('local-login', {
      successRedirect : '/profile',
      failureRedirect : '/create',
    }),
    login: (req,res)=>{res.send(req.user)},
    google:       passport.authenticate('google', {scope : ['email']}),
    googleCB:     (req, res) =>{res.redirect('/profile')},
    facebook:     passport.authenticate('facebook', {scope : ['email']}),
    facebookCB:   (req, res) =>{res.redirect('/profile')},
    logout: (req,res) =>{
      req.logout();
      res.send(req.user);
    }
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
