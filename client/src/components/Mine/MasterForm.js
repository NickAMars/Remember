import React, {Component} from 'react';
import { connect } from 'react-redux';
import {updateMaster,showMasterForm} from '../../actions';
class MasterForm extends Component{
  // pass a changable value to initialize state
  state = { title : "" , visible:false};
  constructor(props){
    super(props);
    this.updateMasterCard =this.updateMasterCard.bind(this);
  }
  // componentDidUpdate(prevProps, prevState){
  //   // console.log(prevProps);
  //   // if(prevProps.test){
  //   // this.setState({visible: this.props.test}) ;
  //   // }
  // }
  componentWillReceiveProps(nextProps){
    if(nextProps.test.visible !== this.state.visible){
      this.setState({visible: nextProps.test.visible , title:nextProps.test.title }) ;
    }
  }

  updateMasterCard(){
    let date = new Date().toDateString();
    // console.log(date);
    this.props.updateMaster(this.props.test.id, { title:this.state.title , date});
    this.props.showMasterForm(false);
  }

  render(){
    return (
      <div className="create__contrainer "  style={ this.state.visible ? { display: 'block'} : {display:'none'} }>
        <div className="create__cards  u-mt-sm">

          <div className="create__field">
            <input onChange={(event) => this.setState({title:event.target.value})} value={this.state.title} type="text"  id="title" className="input__master-title" maxLength="32" />
          </div>
          <div className="create__cta u-mb-sm">
            <button onClick= {this.updateMasterCard} className="create__cta-btn "> Create Master Card </button>
          </div>
        </div>
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


// <input onChange={(event) => this.setState( {title:event.target.value} )} type="text" value={this.state.title} id="title" className="input__master-title" maxLength="32" />
