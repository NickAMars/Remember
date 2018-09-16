const MasterCards = require('../models/MasterCards');
const SubCards = require('../models/SubCards');
/*
testing Testing all functionallities with User

*/
// im already testing create by using the save method
describe('Master', ()=>{
  let MasterNick,SubNick;
  beforeEach(async ()=> {
    MasterNick = new MasterCards({title:"MasterAbby"});
    await MasterNick.save();
  });
  afterEach(async ()=> {
    await MasterNick.remove();
  });
  test("reading all of master card user", async ()=> {
      const findall = await MasterCards.find({code: MasterNick.code });
      expect(findall[0]["title"]).toEqual("MasterAbby");
   });
  test("update a master card", async ()=> {
    await MasterCards.findByIdAndUpdate(MasterNick._id,{url: "SOMETHING"});
    const updateUser = await MasterCards.findOne({ _id: MasterNick._id});
    expect(updateUser.url).toEqual("SOMETHING");
  });
  test("remove master cards remove all subcards",async ()=>{
    await MasterCards.findByIdAndRemove(MasterNick._id);
    let deleteUser = await MasterCards.findOne();
    expect(deleteUser).toEqual(null);
  });

    test("adding a process",async ()=>{
        MasterNick["progress"].push({  time: 40 });
        await MasterNick.save();
        // console.log(MasterNick);
    });

  describe("When Master cards has add a process",()=>{
    beforeEach(async ()=>{
      MasterNick["progress"].push({  time: 80 });
      await MasterNick.save();
    });
    // update the process
    test("updating a progress",async ()=>{
      const find = await MasterCards.findOne({_id: MasterNick._id});
      find.progress[0]["time"] = find.progress[0]["time"] + 20;
      await MasterCards.findByIdAndUpdate(MasterNick._id, find);
      const progressUpdate = await MasterCards.findOne({_id: MasterNick._id});
      expect(progressUpdate["progress"][0]["time"]).toEqual(100);
    });
  })





  // describe("When masterCard add subCard", ()=>{
  //   beforeEach(async ()=> {
  //     SubNick = new SubCards({title:"subtitle"});
  //     await Promise.all([MasterNick.save(),SubNick.save()]);
  //   });
  //   afterEach(async ()=> {
  //     await Promise.all([MasterNick.remove(), SubNick.remove()]);
  //   });
  //   test("", async ()=>{
  //
  //   });
  // });
});
