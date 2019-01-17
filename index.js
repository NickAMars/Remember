const express         = require('express');
const mongoose        = require('mongoose');
const keys            = require('./config/keys');
const passport        = require('passport');
const cookieSession  = require('cookie-session');
const bodyParser      = require('body-parser');
// getting the absolute path
const path = require('path');



mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURL, { useNewUrlParser: true });
const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
// mongoose database
require('./models/SubCards');
require('./models/MasterCards');
require('./models/User');
require('./services/passport')(passport);

app.use(
  cookieSession({
    maxAge: 1000*60*60*24*30,
    keys: [keys.cookieKey]
  })
);

app.use(passport.initialize());
app.use(passport.session());


require('./routes/authRoutes')(app);
require('./routes')(app);
require('./routes/masterCardRoutes')(app);
require('./routes/subCardRoutes')(app);


/*
Getting production ready
*/
// check if we are in the production envir
if(process.env.NODE_ENV === 'production'){
//if cant find route among serverside,
 // looks  to the react routes
  app.use(express.static('client/build'));
  // if we dont recover the route, go to the index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });

}

app.use((err, req, res, next)=>{
  return res.status(err.status|| 500).json({
    error: {
      message:err.message || "OOPs! Something went wrong."
    }
  })
});

const port = process.env.PORT || 5000;
app.listen(port);
