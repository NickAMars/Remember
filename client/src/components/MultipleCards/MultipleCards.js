import React, {Component} from 'react';
import { connect } from 'react-redux';
import {deleteCard,  updateForm} from '../../actions';
import {Card} from './Card';
import Form from './Form';
import PropTypes from 'prop-types';

/*
This section in my application is just the sub cards which
the user have access to from there main cards

  Next Step is to make a section call main cards
*/

export class MultipleCards extends Component{
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
           return (<Card  key={card.id}  {...card} deleteCard={this.props.deleteCard} updateForm={this.props.updateForm} />);
         })
        }
        </div>
      </div>
    );
  }
}

MultipleCards.propTypes ={
    cards: PropTypes.array.isRequired,
    deleteCard: PropTypes.func
}

export const mapStateToProps = (state) => {
  return {
    cards: state.cards
  };
}

export default connect(mapStateToProps,{deleteCard, updateForm})(MultipleCards);
// export default connect(null, {deleteCard})(Card);
