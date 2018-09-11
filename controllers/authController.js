
const User = require('../models/User');
const passport        = require('passport');
module.exports = {

  loginForm: (req,res)=>{
    console.log('login page');
    res.send('login form page for users');
  },
  login: (req,res)=>{
    console.log(req.user);
    res.redirect('/api/profile');
  },
  signup:       passport.authenticate('local-login', {
    successRedirect : '/api/profile',
    failureRedirect : '/api/login',
  }),
  google:       passport.authenticate('google', {scope : ['email']}),
  googleCB:     (req, res) =>{res.redirect('/profile')},
  facebook:     passport.authenticate('facebook', {scope : ['email']}),
  facebookCB:   (req, res) =>{res.redirect('/profile')},
  logout: (req,res) =>{
    req.logout();
    res.send(req.user);
  }
}
