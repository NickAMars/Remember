const User = require('../models/User');
const PoolCard = require('../models/PoolCards');
const PoolSubCard = require('../models/PoolSubCards');
const MasterCard = require('../models/MasterCards');
const SubCard = require('../models/SubCards');
const mongoose = require('mongoose');

module.exports = {
  getPoolCards:  async (req,res) =>{
    // get all pool cards that are made public
    const allPool = await PoolCard.find();
    res.send(allPool);
  },
  addPoolCard:  async (req,res) =>{
    const {author, title, subcards} = req.body.mastercard;
      // create the pool
      const newPool = new PoolCard({author,title});

      await subcards.forEach(async card_id =>{
        // get all subcards in the master card
        let card =  await SubCard.findById(card_id);
        // make a pool sub
        let newSub = new PoolSubCard({title: card.title,   descriptions: card.descriptions });

        // put the pool sub in the created pool
        newPool.subcards.push(newSub);
        // save the new sub pool
        await newSub.save();
        await newPool.save();

      });
      // didnt accept this format
      // await newPool.save();
      const allPool = await PoolCard.find();
      // send it back to the client
      res.send(allPool);
  },
  removePoolCard: async (req,res) =>{
    const poolcard = await PoolCard.findById(req.params.id);

    await poolcard.remove();
    const allPool = await PoolCard.find();
    res.send(allPool);
  },
  subCards: async (req,res) =>{
    const {id} = req.params;
    const findPool = await PoolCard.findById(id).populate("subcards");

    if(!findPool) return res.status(500).send("FAIL TO LOAD CARDS")
    res.send(findPool['subcards']);
  }, // returns back a all master cards
  storePoolToMaster:  async (req,res) =>{
      // create the pool
      const poolcard = await PoolCard.findById(req.params.id).populate("subcards");
      const findUser = await User.findById(req.user);
      const newMaster = new MasterCard({title:poolcard.title });
      findUser.mastercards.push(newMaster);

      poolcard.subcards.forEach( async card => {
          const newSub = new SubCard({title: card.title,   descriptions: card.description });
          newMaster.subcards.push(newSub);
        await  newSub.save();
      });
      newMaster.user = findUser;
      // console.log()
      await Promise.all([findUser.save(), newMaster.save()]);
      res.redirect('/api/profile/MasterCard');

  },
}

// im not going to make a update pool card route
