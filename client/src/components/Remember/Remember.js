import React, {Component} from 'react';
import { connect } from 'react-redux';
import {deleteCard} from '../../actions';
import {Card} from './Card';
import Form from './Form';
import PropTypes from 'prop-types';
/*
Need to Give every card a unique id

*/
export class Remember extends Component{
  render(){
    // console.log(this.props);
    return (
      <div>
        <h1 className="heading-primary">Remember</h1>
        <Form />
        <hr className="u-mt-sm u-mb-sm"/>
        <div className="row">
        {
         /*creating card components*/
         this.props.cards.map((card, index) => {
           return (<Card  key={card.id}  {...card} deleteCard={this.props.deleteCard} />);
         })
        }
       </div>
    </div>
  );
  }
}

Remember.propTypes ={
  cards: PropTypes.array.isRequired
}

export const mapStateToProps = (state) => {
  return {
    cards: state.cards
  };
}

export default connect(mapStateToProps,{deleteCard})(Remember);
// export default connect(null, {deleteCard})(Card);
