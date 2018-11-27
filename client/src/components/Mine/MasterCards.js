import React,{Component} from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {Buttons} from './Buttons';
import {CbPublic} from './CbPublic';
import { deleteMaster, publicMaster,showMasterForm} from '../../actions';
// CbPublic
// camil case
// pass keys to this items when mapping over object
// export const MasterCards = (props) =>{
// update the date and the title with the props
export class MasterCards extends Component{
    constructor(props){
      super(props);
      this.state = {visible: false};
    }

    componentWillReceiveProps(nextProps){
      if(nextProps.test.visible !== this.state.visible){
        this.setState({visible: nextProps.test.visible}) ;
      }
    }
    render(){
      const {title, date,id} = this.props.masterinfo;
      // delMaster={this.props.deleteMaster} updMaster={this.props.showMasterForm} masterid={id}
      return (
            <li className="master__items">
              {!this.state.visible && this.props.visible && <Buttons {...this.props}/>}
              {!this.state.visible && this.props.visible && <CbPublic  pubinfo={this.props.masterinfo} />}
              <Link  to={`/smallcards/${id}`} className="master__links">
                <span className="master__title">{title}</span>
                <span className="master__date">{date}</span>
              </Link>
            </li>
          );
    }
  }

  export const mapStateToProps = (state) => {
    return {
      test: state.test
    };
  }
  export default connect(mapStateToProps,{deleteMaster, publicMaster, showMasterForm} )(MasterCards);

// didnt know i could do that
