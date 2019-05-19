const PoolCard = require('../models/PoolCards');
const SubCard = require('../models/SubCards');

module.exports = {
  getPoolCards:  async (req,res) =>{
    // get all pool cards that are made public
    const allPool = await PoolCard.find().populate('subcards');
    res.send(allPool);
    // These poolcards are mad public so anyone can see them
    // const allPoolCards = await PoolCard.find();
    // res.send(allPoolCards);
  },
  addPoolCard:  async (req,res) =>{
    const {author, title, subcards} = req.body.mastercard;
    const newPool = new PoolCard({author,title});
    await subcards.forEach(card =>{
      const newSub = new SubCard({title: card.title,   descriptions: card.descriptions });
      newPool.subcards.push(newSub);
      newSub.save();
    });
    await newPool.save();
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
    const findPool = await PoolCard.findById(id).populate('subcards');
    if(!findPool) return res.status(500).send("FAIL TO LOAD CARDS")
    res.send(findPool['subcards']);
  }
}

// im not going to make a update pool card route
