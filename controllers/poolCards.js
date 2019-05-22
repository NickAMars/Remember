const PoolCard = require('../models/PoolCards');
const PoolSubCard = require('../models/PoolSubCards');
const SubCard = require('../models/SubCards');
const mongoose = require('mongoose');

module.exports = {
  getPoolCards:  async (req,res) =>{
    // get all pool cards that are made public
    const allPool = await PoolCard.find();
    res.send(allPool);
    // These poolcards are mad public so anyone can see them
    // const allPoolCards = await PoolCard.find();
    // res.send(allPoolCards);
  },
  addPoolCard:  async (req,res) =>{
    const {author, title, subcards} = req.body.mastercard;
      // create the pool
      const newPool = new PoolCard({author,title});

      await subcards.map(async card_id =>{
        // get all subcards in the master card
        let card =  await SubCard.findById(card_id);
        // make a pool sub
        let newSub = new PoolSubCard({title: card.title,   descriptions: card.descriptions });

        // put the pool sub in the created pool
        newPool.subcards.push(newSub);
        // save the new sub pool
        await newSub.save();
        await newPool.save();
        // await Promise.all([newSub.save(), newPool.save()]);
      });
      // save the creaded pool after adding all the sub pool ref
      // await newPool.save();

      // console.log(newPool);
      //get all the pool card
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
    console.log(findPool);
    // findPool['subcards'][0]
     // console.log("get all the pool sub");
     // console.log(findPool)
    //

    if(!findPool) return res.status(500).send("FAIL TO LOAD CARDS")
    res.send(findPool['subcards']);
  }
}

// im not going to make a update pool card route
