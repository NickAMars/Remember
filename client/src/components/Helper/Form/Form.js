import React, {Component} from 'react'
import { connect } from 'react-redux'
import { addCard, updateForm, updateCard } from '../../../actions'
import  uuidv1 from 'uuid/v1'
import PropTypes from 'prop-types'
import {SCAddButton, SCSubmitButton, SCUpdateButton} from '../Buttons'
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
  // componentWillReceiveProps(nextProps){
  //   // console.log("nextProps",nextProps);
  //   let {display, title, description} = nextProps.formupdate;
  //   if(display && this.state.firstRender){
  //     // console.log(display,title,description );
  //     this.setState({firstRender: false, title, description});
  //   }
  // }
  static getDerivedStateFromProps({formupdate : {display, title, description}},  state){
      // let {display, title, description} = props.formupdate;
      if(display && state.firstRender){
        // console.log(display,title,description );
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
    // console.log(this.props)
    let {display} = this.props.formupdate;
    let valueI=  this.state.title;
    let valueTA = this.state.description;
    return (
           <div>
                 <div className="input__box">
                  <Input onChange={this.onChangeI} value={valueI}/>
                  <TextArea onChange={this.onChangeTA} value={valueTA}/>

                  <SCUpdateButton onClick={this.Update} display={display}/>
                  <SCAddButton onClick={this.Add}/>
                  <SCSubmitButton onClick= {this.props.Submit}/>
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
