const express = require('express');
const mongoose       = require('mongoose');
const keys          = require('./config/keys');
const bodyParser    = require('body-parser');
// getting ride of deprecationWarning
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURL, { useNewUrlParser: true });
const app = express();

app.use(bodyParser.json());
require('./models/User');
require('./routes')(app);




const port = process.env.PORT || 5000;
app.listen(port, ()=>{
  console.log("Server Working");
})
