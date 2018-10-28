import React, {Component} from 'react';
import { connect } from 'react-redux';
import { addCard, updateForm, updateCard } from '../../actions';
import  uuidv1 from 'uuid/v1'
import PropTypes from 'prop-types';
/*
    I want the update method to use the same form.
    I want to make it obvious that the forms beening use for the update
*/

export class Form extends Component{
  constructor(props){
    super(props);
    this.state = {
      title:'',
      description:'',
      firstRender: true
    };
  }
  /*
    Place this.props.updateForm({}); to fix an issue with updating something else after adding
    problem with deleting a field as well
  */
componentWillReceiveProps(nextProps){
  // console.log("nextProps",nextProps);
  let {display, title, description} = nextProps.formupdate;
  if(display && this.state.firstRender){
    // console.log(display,title,description );
    this.setState({firstRender: false, title, description});
  }
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

  render(){
    let {display} = this.props.formupdate;
    return (
           <div>
                <div className="input__box">
                  <input
                    autoFocus
                    className="input__field"
                    type="text"
                    onChange={(event)=>{ this.setState({ title: event.target.value}) }}
                    value={this.state.title}
                    maxLength="32"
                  />
                  <textarea
                    className="input__textarea"
                    name="basic" rows="5" cols="50" maxLength="200"
                    onChange={(event)=>{ this.setState({ description: event.target.value }) }}
                    value={this.state.description}
                    >
                  </textarea>
                  <button onClick={this.Update}  className={display?"btn btn__update btn__update-show":"btn btn__update btn__update-hide"}>U</button>
                  <button onClick={this.Add}  className="btn btn__add">+</button>
                </div>
          </div>
        );
  }
}
Form.propTypes ={
  addCard: PropTypes.func
}

export const mapStateToProps = (state) => {
  return {
    formupdate: state.formupdate
  };
}
export const validate = ({title,description }) => {
    if( title !== '' && description !== '') return true;
    return false;
}
export default connect(mapStateToProps, {addCard, updateForm, updateCard})(Form);

//https://medium.com/backticks-tildes/testing-your-react-component-with-jest-and-enzyme-276eef45bea0

// for lifecycle methods
//https://engineering.musefind.com/react-lifecycle-methods-how-and-when-to-use-them-2111a1b692b1
