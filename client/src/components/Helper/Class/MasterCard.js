 export default class MasterCard {
  constructor(){
    this.id = "";
    this.author= ""; // user code
    this.title= "";
    this.subcards = [];
    this.timestamp= new Date();
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
  setSubCards(subcards){
    this.subcards= subcards;
    return this;
  }
  setTimestamp(timestamp){
    this.timestamp= timestamp;
    return this;
  }
  setCount(count){
    this.count = count;
    return this;
  }

  getID(){return this.id;}
  getAuthor(){ return this.author;}
  getTitle(){ return this.title;}
  getSubCards(){return this.subcards;}
  getTimestamp(){ return this.timestamp;}
  getCount(){ return this.count;}

  incrementCount(){this.count++;}
  decrementCount(){
    if(this.count > 0)
      this.count--;
  }

  get CardInfo(){
    const string = `Creater: ${this.author}; Title: ${this.title};  Timestamp: ${this.timestamp}`;
    return string;
  }
}



//Since to access the instance
