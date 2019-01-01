import React,{Component} from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
// import {Buttons} from './Buttons';
import {UpdateButton, RemoveButton } from '../Buttons'
import {CbPublic} from '../InputField';
import { deleteMaster,showMasterForm} from '../../../actions';


class MasterCard extends Component{
    constructor(props){
      super(props);
      this.state = {visible: false};
    }

    componentWillReceiveProps(nextProps){
      if(nextProps.test.visible !== this.state.visible){
        this.setState({visible: nextProps.test.visible}) ;
      }
    }
        // {!this.state.visible && this.props.visible &&  <Buttons {...this.props}/>}
    render(){
      const {title, date,id} = this.props.masterinfo;
      return (
            <li className="master__items">
              <div  className="master__svg ">
                {!this.state.visible && this.props.visible &&  <UpdateButton onClick={this.UpdateButton} masterinfo={this.props.masterinfo}/>}
                {!this.state.visible && this.props.visible &&  <RemoveButton onClick={this.RemoveButton} ID={id}/>}
              </div>
            {!this.state.visible && this.props.visible && <CbPublic  pubinfo={this.props.masterinfo} />}
              <Link  to={`/smallcards/${id}`} className="master__links">
                <span className="master__title">{title}</span>
                <span className="master__date">{date}</span>
              </Link>
            </li>
          );
    }
    UpdateButton  = () => {
      const {id,title} = this.props.masterinfo;

      this.props.showMasterForm(true, id, title);
      // console.log("Update action creator to shhow form The Button");
    }
    RemoveButton  = () => {
      const {id} = this.props.masterinfo;
      this.props.deleteMaster(id);
      // console.log("RemoveButton The Button");
    }
  }

const mapStateToProps = (state) => {
    return {
      test: state.test
    };
  }

  export default connect(mapStateToProps,{deleteMaster, showMasterForm} )(MasterCard);
