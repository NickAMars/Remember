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
      const findall = await MasterCards.find({_id: MasterNick._id});
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
        const find = await MasterCards.findOne();
        // console.log(find["progress"][0]["time"]);
        expect(find["progress"][0]["time"]).toEqual(40);
    });

  describe("When Master cards has add a process",()=>{
    beforeEach(async ()=>{
      MasterNick["progress"].push({  time: 80 });
      await MasterNick.save();
    });

    test("updating a progress",async ()=>{
      const find = await MasterCards.findOne({_id: MasterNick._id});
      find.progress[0]["time"] = find.progress[0]["time"] + 20;
      await MasterCards.findByIdAndUpdate(MasterNick._id, find);
      const progressUpdate = await MasterCards.findOne({_id: MasterNick._id});
      expect(progressUpdate["progress"][0]["time"]).toEqual(100);
    });
  })


});

/*
  im only going to do two things with  the progress

  im going to update the time frequently by how much
  the second the user spends on there alread created master card
  The date is updated by the sever. You can only have a maximum of 7 days.
  Then when a new day comes in it pops off the stack.
*/
