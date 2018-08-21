import React, {Component} from 'react';
import { connect } from 'react-redux';
import { addCard } from '../actions';
import {Card} from './Card';

export class Remember extends Component{
  constructor(){
    super();
    this.state = {
          title:'TITLE...',
          description:''
    };
  }
  // componentDidMount(){
  //    this.nameInput.focus();
  //  }
  render(){
    console.log(this.props);
    return (
      <div>
        <h1 className="heading-primary">Remember</h1>
        <div className="input__box">
          <input
          autoFocus
            className="input__field"
            type="text"
            onChange={(event)=>{ this.setState({ title: event.target.value}) }}
            value={this.state.title}
         />

          <textarea
          className="input__textarea"
          name="basic" rows="5" cols="50" maxLength="200"
          onChange={(event)=>{ this.setState({ description: event.target.value }) }}
          value={this.state.description}
          >
        </textarea>
        </div>


        <hr className="u-mt-sm u-mb-sm"/>

       <div className="row">
          <Card />
       </div>
        <button onClick={UpdateField.bind(this)}  className="btn btn__add">+</button>
      </div>
    );

  }
}
function UpdateField(){
  this.props.addCard(this.state);
  this.setState({
      title: '',
      description: ''
   });
}

function mapStateToProps(state){
  console.log(state);
  // console.log(state.cards);
  return {
    cards: state.cards
  };
}

export default connect(mapStateToProps, { addCard } )(Remember);
