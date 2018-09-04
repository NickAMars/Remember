import React, {Component} from 'react';
import { connect } from 'react-redux';
import { addCard } from '../../actions';
import PropTypes from 'prop-types';

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
      this.props.addCard(this.state);
      this.emptyState();
  }
  emptyState = () => {
    this.setState({  title: '',description: ''});
  }

  render(){
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
                  <button onClick={this.Add}  className="btn btn__add">+</button>
                </div>
          </div>
        );
  }
}
Form.propTypes ={
  addCard: PropTypes.func
}

export const validate = ({title,description }) => {
    if( title !== '' && description !== '') return true;
    return false;
}
export default connect(null, {addCard})(Form);

//https://medium.com/backticks-tildes/testing-your-react-component-with-jest-and-enzyme-276eef45bea0
