import React, {Component} from 'react';
import { connect } from 'react-redux';
import { addCard } from '../actions';

export class Form extends Component{
  constructor(){
    super();
    this.state = {
          title:'TITLE...',
          description:''
    };
  }

  Add(){
    const {title, description} = this.state;
    if( title !== '' && description !== '')
      this.props.addCard(this.state);

    this.setState({
        title: '',
        description: ''
     });
  }

  render(){
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
                  <button onClick={this.Add.bind(this)}  className="btn btn__add">+</button>
                </div>
          </div>
        );
  }
}
export default connect(null, {addCard})(Form);
