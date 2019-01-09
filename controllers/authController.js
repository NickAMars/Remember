
const User = require('../models/User');
const helpers           = require('../services/helpers');
const passport        = require('passport');
const uuidv4            = require('uuid/v4');

module.exports = {
  signup: async (req, res)=> {
    const {name, password}=req.body;

    // console.log(name, password)
    const hash = await helpers.hash(password);
    const existingUser = await User.findOne({ 'name': name});
    if(existingUser)
        return res.status(500).send("User already Exist");
    // generate a random id
    const newUser = new User({code: uuidv4(), name: name, password: hash });
    await newUser.save();
    // console.log(newUser)
    // return done(null, newUser);
    res.send(newUser);

  },
  login:
    passport.authenticate('local',{
      successRedirect : '/main',
      failureRedirect : '/'
    })
  ,
  google:       passport.authenticate('google', {scope : ['email']}),
  googleCB:     (req, res) =>{res.redirect('/main')},
  facebook:     passport.authenticate('facebook', {scope : ['email']}),
  facebookCB:   (req, res) =>{res.redirect('/main')},
  logout: (req,res) =>{
    req.logout();
    res.redirect('/');
  }
}
/*
 makes it possible to access the user email information
scope :['email']
*/

// signup: passport.authenticate('local-signup',{
//   successRedirect : '/main', // redirect to the secure profile section
//   failureRedirect : '/' // redirect back to the signup page if there is an error
// }),
