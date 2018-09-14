const User = require('../models/User');
const MasterCards = require('../models/MasterCards');
/*
testing the user functionality before using them in my code
*/
describe('User', ()=>{
let Nick, MasterNick;
// add user at the begining of every test
  beforeEach(async ()=> {
    Nick = new User({code: "ok", name: "Nick", password: "password"});
    MasterNick = new MasterCards({title:"title"});
    await Nick.save();
     await Promise.all([Nick.save(), MasterNick.save()]);
  });
  // remove user at the end of each test
  afterEach(async ()=> {
     await Promise.all([Nick.remove(), MasterNick.remove()]);
  });
  test('read  all user successful', async () => {
    const findall = await User.find({code: Nick.code });
    expect(findall[0].code).toEqual("ok");
  });
  test('read a user successful', async () => {
    const find = await User.findOne({code: Nick.code });
    expect(find["code"]).toEqual("ok");
  });


  test('update user successful', async () => {
    await User.findByIdAndUpdate(Nick._id,{code: "ok", name: "Nick", password: "pudding"});
    const updateUser = await User.findOne({password: "pudding"});
     expect(updateUser.password).toEqual("pudding");
  });
  test('delete user successful', async () => {
     await User.findByIdAndRemove(Nick._id);
     let deleteUser = await User.findOne();
     expect(deleteUser).toEqual(null);
  });



  describe('When user add master',()=>{
    // add master
    beforeEach(async ()=> {
      Nick.mastercards.push(MasterNick);
      await Nick.save();
    });

    // amount of master cards user has
    test('Count the amount of Master Cards a user has', async () => {
        expect(Nick.countCards).toEqual(1);
    });

    test('find mastercard in user', async () => {
        const find = await User.findOne({code: "ok"}).populate('mastercards');
        expect(find["mastercards"][0]["title"]).toEqual("title");
    });


    // test if the master change while in the user model does the user have the upadted master
    test('change updated to user from master mondel update', async () => {
    const findmaster = await MasterCards.findOne({title: "title"});
    await MasterCards.findByIdAndUpdate(findmaster._id,{title: "ok", progress:[ {time: 900} ]});
    const findUser = await User.findOne({code: "ok"}).populate('mastercards');
    expect(findUser["mastercards"][0]["progress"][0]["time"]).toEqual(900);
    });

    test('delete all the master cards from user', async () => {
      await Nick.remove();
      // counts the amount of master cards
      const count = await MasterCards.count();
      expect(count).toEqual(0);
    });
  });
});



/*
// the user model controls only until the master models
// The mastercard model controll the progress and the subcard
// the subcard doesnt have reference to the user yet but i want i to so that people can share cards globally or privatly
  maybe should let the master card have the privilage of shareing cards

  Then when another user click on a card that is not there. the user has the option of adding that card to there stack
*/



/*
  Laptops down but still want to post something.
  Thing i want to test.
  Middleware which takes all the subcard as well as the master card infromation
*/
