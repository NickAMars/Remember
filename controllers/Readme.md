
CRUD
Users === index.js
get the master card from the user
masters === masterCard.js
Cards  === subCard.js


//User
Create master cards
Track date recieve from master card
//CRUD operation to for to ensure trust between user.
// use  pre middleWare to get rid of
  all the information the user has
  on  masterCards and subCards

//Master Card
all master cards should have a reference to the user
operations of the master card is to keep track of the subcard include:
Data of sub
The Amount of
//CRUD operation
Create to make a new master Card
read operation to get all master card
get update for masterCards
or remove masterCard
// use  pre middleWare to get rid of
  all the information on the master card
   as well as the sub card.

//Sub Cards
keeps track of the cards inside of the relative master card
Have CRUD to for mistakes




// // TEST CASE
// async test(req,res,next){
//   try{
//     const newUser = await User.create(req.body);
//     res.send(newUser);
//   }catch(err){
//     next(err);
//   }
// },
