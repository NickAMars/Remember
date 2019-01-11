import React,{Component} from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
// import {Buttons} from './Buttons';
import {UpdateButton, RemoveButton } from '../Buttons'
import {CbPublic} from '../InputField';
import { deleteMaster, getSmallCards} from '../../../actions';


class MasterCard extends Component{
    constructor(props){
      super(props);
      this.state = {visible: false};
    }

    // static getDeriveStateFromProps(nextProps, state){
    //   if(nextProps.test.visible !== state.visible){
    //     this.setState({visible: nextProps.test.visible}) ;
    //   }
    // }
        // {!this.state.visible && this.props.visible &&  <Buttons {...this.props}/>}
    render(){
      const {title, date,_id} = this.props.masterinfo;
      return (
            <li className="master__items">
              <div  className="master__svg ">
                {!this.state.visible && this.props.visible &&  <UpdateButton onClick={this.UpdateButton} masterinfo={this.props.masterinfo}/>}
                {!this.state.visible && this.props.visible &&  <RemoveButton onClick={this.RemoveButton} ID={_id}/>}
              </div>
            {!this.state.visible && this.props.visible && <CbPublic  pubinfo={this.props.masterinfo} />}
              <Link  to={`/smallcards/${_id}`} className="master__links" onClick={()=>this.props.getSmallCards(_id)}>
                <span className="master__title">{title}</span>
                <span className="master__date">{date}</span>
              </Link>
            </li>
          );
    }
    UpdateButton  = () => {
      const {_id,title} = this.props.masterinfo;
      this.props.showMasterForm(_id,title);
      this.props.toggleMasterForm();
    }
    RemoveButton  = () => {
      const {_id} = this.props.masterinfo;
      console.log(_id)
      // this.props.deleteMaster(_id);
    }
  }

const mapStateToProps = (state) => {
    return {
      // test: state.mastercards
    };
  }

  export default connect(mapStateToProps,{deleteMaster,  getSmallCards} )(MasterCard);
