
const User = require('../models/User');
const passport        = require('passport');
module.exports = {
  signup:       passport.authenticate('local-login', {
    successRedirect : '/profile',
    failureRedirect : '/create',
  }),
  login: (req,res)=>{
    console.log(req.user);
    res.redirect('/profile');
  },
  google:       passport.authenticate('google', {scope : ['email']}),
  googleCB:     (req, res) =>{res.redirect('/profile')},
  facebook:     passport.authenticate('facebook', {scope : ['email']}),
  facebookCB:   (req, res) =>{res.redirect('/profile')},
  logout: (req,res) =>{
    req.logout();
    res.send(req.user);
  }
}
