import React, {Component } from 'react';
import { connect } from 'react-redux';
import {updateMaster} from '../../../actions';
class MasterForm extends Component{
  // pass a changable value to initialize state
  // state = { title : "" , visible:false};
  // state = {visible:false};
  constructor(props){
    super(props);
    this.updateMasterCard =this.updateMasterCard.bind(this);
    this.inputRef = React.createRef();
  }

  // componentDidUpdate(prevProps, prevState){}
  updateMasterCard(event){
    event.preventDefault();
    this.props.updateMaster(
      this.props._id,
       {
         title:this.inputRef.current.value
       });
    this.props.toggleMasterForm();
  }

  render(){
    return (
      <div className="create__contrainer">
        <form className="create__cards">
          <div className="create__field">
            <input type="text" ref={this.inputRef} placeholder={this.props.title} className="input__master-title" maxLength="128" />
          </div>
          <div className="create__cta">
            <button onClick={this.updateMasterCard} className="create__cta-btn">Update</button>
            <button type="button" onClick={this.props.toggleMasterForm} className="create__cta-btn create__cta-btn--cancel">Cancel</button>
          </div>
        </form>
      </div>
    );
  }
}
// style={ this.state.visible ? { display: 'block'} : {display:'none'}
// const mapStateToProps = (state) => {
//   return {
//     test: state.test
//   };
// }

 export default connect(null, {updateMaster})(MasterForm);
