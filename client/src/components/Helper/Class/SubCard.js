export default class SubCard {
  constructor(){
    this.id = "";
    this.title= "";
    this.description = [];
    this.count = 0;
  }
  setID(id){this.id= id;}
  setTitle(title){this.title= title;}
  setDescription(description){this.title= title;}
  setCount(count){this.count = count;}

  getID(){return this.id;}
  getTitle(){ return this.title;}
  getDescription(){return this.title;}
  getCount(){ return this.count;}

  incrementCount(){this.count++;}
  decrementCount(){
    if(this.count > 0)
      this.count--;
  }
}
