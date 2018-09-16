const User = require('../models/User');
const MasterCards = require('../models/MasterCards');
const SubCards = require('../models/SubCards');
/*
testing Testing all functionallities with User
*/
describe('User', ()=>{
let Nick, MasterNick,SubNick;
  beforeEach(async ()=> {
    Nick = new User({code: "ok", name: "Nick", password: "password"});

    await Nick.save();
  });
  // remove user at the end of each test
  afterEach(async ()=> {
     await Nick.remove();
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
      // Nick = new User({code: "ok", name: "Nick", password: "password"});
      MasterNick = new MasterCards({title:"title"});
      Nick.mastercards.push(MasterNick);
      await Promise.all([Nick.save(), MasterNick.save()]);
    });

    afterEach(async ()=> {
      await Promise.all([Nick.remove(), MasterNick.remove()]);
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
    test('update change to master model affect user data', async () =>{
    const findmaster = await MasterCards.findOne({title: "title"});
    await MasterCards.findByIdAndUpdate(findmaster._id,{title: "ok", progress:[ {time: 900} ]});
    const findUser = await User.findOne({code: "ok"}).populate('mastercards');
    expect(findUser["mastercards"][0]["progress"][0]["time"]).toEqual(900);
    });

    test('delete all the master cards from user', async () => {
      await Nick.remove();
      const count = await MasterCards.count();
      expect(count).toEqual(0);
    });



      describe('When user add SubCards to master Cards ',()=>{
        beforeEach(async ()=> {
          SubNick = new SubCards({title:"subtitle"});
          //
          Nick.mastercards.push(MasterNick);
          MasterNick.subcards.push(SubNick);
          SubNick.user = Nick;
          await Promise.all([Nick.save(), MasterNick.save(),SubNick.save()]);
        });
        afterEach(async ()=> {
          await Promise.all([Nick.remove(), MasterNick.remove(), SubNick.remove()]);
        });

        test("find subcard if succesfully added to Master card which is in the user",async ()=>{
          const user = await User.findOne({code: 'ok'}).populate({
              path: 'mastercards',
              populate: {
                path: 'subcards',
                model: 'subcards',
                populate:{
                  path: 'user',
                  model: 'users'
                }
              }
            });
          expect(user.mastercards[0]["subcards"][0]["title"]).toEqual("subtitle");
        })
      });
  });
});




/*
Cascade deletion
  https://stackoverflow.com/questions/14348516/cascade-style-delete-in-mongoose
*/
