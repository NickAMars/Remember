import React, {Component } from 'react';
import { connect } from 'react-redux';
import {updateMaster,showMasterForm} from '../../actions';
class MasterForm extends Component{
  // pass a changable value to initialize state
  // state = { title : "" , visible:false};
  state = {visible:false};
  constructor(props){
    super(props);
    this.updateMasterCard =this.updateMasterCard.bind(this);
    this.inputRef = React.createRef();
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.test.visible !== this.state.visible){
      this.setState((state, props)=>{
        return {visible: nextProps.test.visible};
      }) ;
    }
  }
  // componentDidUpdate(prevProps, prevState){
  //   // console.log(prevProps);
  //   // if(prevProps.test){
  //   if(prevProps.test.visible !== this.state.visible)
  //   this.setState({ title: prevProps.test.title}) ;
  //   console.log("DidUpdate");
  //
  //   // }
  // }
  updateMasterCard(event){
    event.preventDefault();
    let date = new Date().toDateString();
    this.props.updateMaster(this.props.test.id, { title:this.inputRef.current.value, date});
    this.props.showMasterForm(false);
  }

  render(){
    return (
      <div className="create__contrainer "  style={ this.state.visible ? { display: 'block'} : {display:'none'} }>
        <form className="create__cards  u-mt-sm">

          <div className="create__field">
              <input type="text" ref= {this.inputRef} placeholder="update" className="input__master-title" maxLength="32" />
          </div>
          <div className="create__cta u-mb-sm">
            <button onClick= {this.updateMasterCard} className="create__cta-btn "> Update Master Card </button>
          </div>
        </form>
      </div>
    );
  }
}

export const mapStateToProps = (state) => {
  return {
    test: state.test
  };
}

 export default connect(mapStateToProps, {updateMaster,showMasterForm})(MasterForm);
