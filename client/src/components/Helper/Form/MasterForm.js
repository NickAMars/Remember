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
    let date = new Date().toDateString();
    this.props.updateMaster(
      this.props._id,
       {
         title:this.inputRef.current.value,
         date
       });
    this.props.toggleMasterForm();
  }

  render(){
    return (
      <div className="create__contrainer "  >
        <form className="create__cards  u-mt-sm">

          <div className="create__field">
              <input type="text" ref= {this.inputRef} placeholder={this.props.title} className="input__master-title" maxLength="32" />
          </div>
          <div className="create__cta u-mb-sm">
            <button onClick= {this.updateMasterCard} className="create__cta-btn "> Update Master Card </button>
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
