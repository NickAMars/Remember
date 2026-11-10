import React, {Component} from 'react'
import { connect } from 'react-redux'
import { addCard, updateForm, updateCard } from '../../../actions'
import { v1 as uuidv1 } from 'uuid'
import PropTypes from 'prop-types'
import {Input, TextArea} from '../InputField'

export class Form extends Component{
  constructor(props){
    super(props);
    this.state = {
      title:'',
      description:'',
      firstRender: true
    };
  }
  static getDerivedStateFromProps({formupdate : {display, title, description}},  state){
      // let {display, title, description} = props.formupdate;
      if(display && state.firstRender){
         return{firstRender: false, title, description};
      }
      return null;
  }

  onChangeI = (event) => {
    this.setState({ title: event.target.value});
  }
  onChangeTA = (event) => {
    this.setState({ description: event.target.value });
  }
  render(){
    let {display} = this.props.formupdate;
    let valueI=  this.state.title;
    let valueTA = this.state.description;
    return (
           <div>
                 <div className="input__box">
                  <Input onChange={this.onChangeI} value={valueI}/>
                  <TextArea onChange={this.onChangeTA} value={valueTA}/>

                  <div className="form-actions">
                    <button onClick={this.Add} className="form-actions__btn form-actions__btn--add" title="Add a new sub card to this deck">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      <span>Add Card</span>
                    </button>
                    {display && <button onClick={this.Update} className="form-actions__btn form-actions__btn--update" title="Update the selected card">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span>Update</span>
                    </button>}
                    <button onClick={this.props.Submit} className="form-actions__btn form-actions__btn--submit" title="Save all cards to the server">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 5L6.5 11.5 3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span>Save All</span>
                    </button>
                  </div>
                </div>
          </div>
        );
  }

  Add = () => {
    if(validate(this.state))
      this.props.addCard({id:uuidv1() ,...this.state});
      this.emptyState();
      //fixes a problem after you ad the card of an updated field
      this.props.updateForm({});
  }
  Update = () =>{
    let {id} = this.props.formupdate;
    let {title, description} = this.state;
    this.props.updateCard({id,title,description});
    this.emptyState();
    this.props.updateForm({});
  }
  emptyState = () => {
    this.setState({  title: '',description: '',firstRender: true});
  }
}

Form.propTypes ={
  addCard: PropTypes.func
}
export const validate = ({title ,description }) => {
    if( title !== '' && description !== '') return true;
    return false;
}
export const mapStateToProps = (state) => {
  return {
    formupdate: state.formupdate
  };
}
export default connect(mapStateToProps, {addCard, updateForm, updateCard})(Form);
