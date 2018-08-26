const User = require('../models/User');

module.exports = {
    async test(req,res,next){
      try{
        const newUser = await User.create(req.body);
        res.send(newUser);
      }catch(err){
        next(err);
      }
    },
    landing(req,res){res.send('Landing');},
    create(req, res){res.send("CREATE POST");},
    wildCard(req, res){ res.send('Wild Card');}
}
