// jest.setTimeout(10000);
const mongoose = require('mongoose');
const keys     = require('../config/keys');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURL, { useNewUrlParser: true });



beforeEach(function(done) {
function clearDB(){
  //remove everything from database
  for (var i in mongoose.connection.collections) {
    mongoose.connection.collections[i].remove(function() {});
  }
  // done function waits until everthing is finish
  return done();
}

// Connection ready state
//
// 0 = disconnected
// 1 = connected
// 2 = connecting
// 3 = disconnecting
if (mongoose.connection.readyState === 0) {
    //try to connect
    mongoose.connect(keys.mongoURL,
      (err) => {
        if (err) throw err;
        // if no error clear database
        return clearDB();
      }
    );

  } else {
    // removes all before each 
    return clearDB();
  }
});

afterEach(function(done) {
  mongoose.disconnect();
  return done();
});

afterAll(done => {
  return done();
});

/*
jest
setup to work with mongoose
https://medium.com/@art.longbottom.jr/concurrent-testing-with-mongoose-and-jest-83a27ceb87ee


defined the TEST_SUITE to be scoped to just system tests.
This will create a new test database for each suite that we are running

-- allows for faster testing
process.env.TEST_SUITE = 'spacetime-systems-test';
*/
