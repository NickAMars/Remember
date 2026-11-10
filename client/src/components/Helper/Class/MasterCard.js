 export default class MasterCard {
  constructor(){
    this.id = "";
    this.author= ""; // user code
    this.title= "";
    this.subCards = [];
    this.createdAt= new Date();
    this.count = 0;// the amount of cards
  }
  setID(id){
    this.id= id;
    return this;
  }
  setAuthor(author){
    this.author= author;
    return this;
  }
  setTitle(title){
    this.title= title;
    return this;
  }
  setSubCards(subCards){
    this.subCards= subCards;
    return this;
  }
  setCreatedAt(createdAt){
    this.createdAt= createdAt;
    return this;
  }
  setCount(count){
    this.count = count;
    return this;
  }

  getID(){return this.id;}
  getAuthor(){ return this.author;}
  getTitle(){ return this.title;}
  getSubCards(){return this.subCards;}
  getCreatedAt(){ return this.createdAt;}
  getCount(){ return this.count;}

  incrementCount(){this.count++;}
  decrementCount(){
    if(this.count > 0)
      this.count--;
  }

  get CardInfo(){
    const string = `Creater: ${this.author}; Title: ${this.title};  CreatedAt: ${this.createdAt}`;
    return string;
  }
}



//Since to access the instance
