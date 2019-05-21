const PoolCard = require('../models/PoolCards');
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
    const newPool = new PoolCard({author,title});
    console.log(newPool);
    console.log("seperate")
    await subcards.forEach(async card_id =>{
      let card =  await SubCard.findById(card_id);
          // console.log(card);
      let newSub = new SubCard({title: card.title,   descriptions: card.descriptions });
      newPool.subcards.push(newSub);
      await newSub.save();
    });
    await newPool.save();
    console.log(newPool);
    const allPool = await PoolCard.find();
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
    // findPool['subcards'][0]
     console.log("get all the pool sub");
     console.log(findPool)
    //

    if(!findPool) return res.status(500).send("FAIL TO LOAD CARDS")
    res.send(findPool['subcards']);
  }
}

// im not going to make a update pool card route
