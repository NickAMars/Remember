const express         = require('express');
const mongoose        = require('mongoose');
const keys            = require('./config/keys');
const passport        = require('passport');
const cookieSession  = require('cookie-session');
const bodyParser      = require('body-parser');



mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURL, { useNewUrlParser: true });
const app = express();

app.use(bodyParser.json());
require('./models/User');
require('./services/passport');

app.use(
  cookieSession({
    maxAge: 1000*60*60*24*30,
    keys: [keys.cookieKey]
  })
);

app.use(passport.initialize());
app.use(passport.session());


require('./routes')(app);




const port = process.env.PORT || 5000;
app.listen(port, ()=>{
  console.log("Server Working");
})
