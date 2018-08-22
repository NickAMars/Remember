import React, {Component} from 'react';
import { connect } from 'react-redux';
import {Card} from './Card';
import Form from './Form';

export class Remember extends Component{
  render(){
    return (
      <div>
        <Form />
        <hr className="u-mt-sm u-mb-sm"/>
        <div className="row">
        {
         /*creating card components*/
         this.props.cards.map((card, index) => {
           return (<Card key={index}  card={card} />);
         })
        }
       </div>
    </div>
  );
  }
}

function mapStateToProps(state){
  return {
    cards: state.cards
  };
}

export default connect(mapStateToProps)(Remember);
