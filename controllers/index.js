const User = require('../models/User');
const passport        = require('passport');
module.exports = {
    // signUp(req,res){res.send("Signup");},
    profile : (req,res) => res.send(req.user) ,
    create: (req, res)=>res.send("CREATE POST")
}
