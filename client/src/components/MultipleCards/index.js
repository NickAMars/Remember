import React, {Component} from 'react'
import { connect } from 'react-redux'
import {deleteCard,  updateForm, submitCard} from '../../actions'
import { CLEAR_CARDS } from '../../actions/types'
// import {Header} from '../Header';
import {Card} from './Card'
import {Form} from '../Helper/Form'
import {CardSizeControl} from '../CardSizeControl'
import PropTypes from 'prop-types'

export class MultipleCards extends Component{
  render(){
    // console.log(this.submitClick);
    return (
      <div className="remember">
        <Form Submit ={this.Submit}/>
        <CardSizeControl/>
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
  Submit = async () => {
     const {title} = this.props.match.params;
     const { cards } = this.props;
     if(cards.length  !== 0){
       this.props.submitCard( title, cards);
     }
     this.props.dispatch({ type: CLEAR_CARDS });
     this.props.history.push('/home');
  }
  componentWillUnmount(){
    this.props.dispatch({ type: CLEAR_CARDS });
  }


}






MultipleCards.propTypes ={
    cards: PropTypes.array.isRequired,
    deleteCard: PropTypes.func,
    updateForm: PropTypes.func,
    submitCard: PropTypes.func
}

export const mapStateToProps = (state) => {
  return {
    cards: state.cards,
    user: state.user
  };
}

const mapDispatchToProps = (dispatch) => ({
  deleteCard: (...args) => dispatch(deleteCard(...args)),
  updateForm: (...args) => dispatch(updateForm(...args)),
  submitCard: (...args) => dispatch(submitCard(...args)),
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(MultipleCards);
