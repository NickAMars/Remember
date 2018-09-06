import React, {Component} from 'react';
import { connect } from 'react-redux';
import { addCard } from '../../actions';
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
      description:''
    };
  }

  Add = () => {

    if(validate(this.state))
      this.props.addCard({id:uuidv1() ,...this.state});
      this.emptyState();
  }
  emptyState = () => {
    this.setState({  title: '',description: ''});
  }

  render(){
    // const {display, id, title, description} = this.props.formupdate;
    // console.log(this.props.formupdate);
    return (
           <div>
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
                  {
                    /*
                    steps:
                    1.render button
                    2. when button is click
                    3. update forUpdate display: false card to be null
                    4. use the update card method to remove and add a new card
                    5. end of update
                    */
                  }
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
export default connect(mapStateToProps, {addCard})(Form);

//https://medium.com/backticks-tildes/testing-your-react-component-with-jest-and-enzyme-276eef45bea0
