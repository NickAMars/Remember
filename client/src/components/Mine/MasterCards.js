import React,{Component} from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {Buttons} from './Buttons';
import {CbPublic} from './CbPublic';
import { deleteMaster, updateMaster, publicMaster} from '../../actions';
// CbPublic
// camil case
// pass keys to this items when mapping over object
// export const MasterCards = (props) =>{
  // update the date and the title with the props
  export class MasterCards extends Component{
    render(){
      const {title, date,id} = this.props.masterinfo;
      return (
            <li className="master__items">
              <Buttons  delMaster={this.props.deleteMaster} masterid={id}/>
              <CbPublic pubinfo={this.props.masterinfo} />
              <Link  to={`/smallcards/${id}`} className="master__links">

                <span className="master__title">{title}</span>
                <span className="master__date">{date}</span>
              </Link>
            </li>
      );
    }

  }
  export default connect(null,{deleteMaster, updateMaster, publicMaster} )(MasterCards);

// }
