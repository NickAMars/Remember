import React,{Component} from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
// import {Buttons} from './Buttons';
import {UpdateButton, RemoveButton } from '../Buttons'
import {CbPublic} from '../InputField';
import { deleteMaster,deletePoolCard, getSmallCards, addPoolCard, getPoolSubCard} from '../../../actions';


class MasterCard extends Component{
    constructor(props){
      super(props);
      this.state = {visible: false};
    }

    static getDerivedStateFromProps(nextProps, state){
      const {masterinfo, user, pathname} = nextProps;
      if(masterinfo.author === user || pathname === '/mine') return {visible : true};
      else return {visible : false};
      // return null;
    }
        // {!this.state.visible && this.props.visible &&  <Buttons {...this.props}/>}
    render(){
      const {title, date,_id} = this.props.masterinfo;
      const {pathname} = this.props;

      return (
            <li className="master__items">
              <div  className="master__svg ">
                { this.props.visible &&  <UpdateButton onClick={this.UpdateButton} masterinfo={this.props.masterinfo}/>}
                { this.state.visible &&  <RemoveButton onClick={this.RemoveButton} ID={_id}/>}
              </div>
            { this.props.visible && <CbPublic  pubinfo={this.props.masterinfo} addPoolCard={this.props.addPoolCard} />}
              <Link  to={{ pathname:`/smallcards/${_id}`, query: { prevent:pathname === '/more'? true:false  }}} className="master__links"
               onClick={()=> pathname === '/more' ?this.props.getPoolSubCard(_id) :this.props.getSmallCards(_id)}>
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
      const {pathname} = this.props;
      // console.log(pathname)
      if(pathname === '/more')
        this.props.deletePoolCard(_id);
      else
        this.props.deleteMaster(_id);
    }
  }

const mapStateToProps = (state) => {
    return {
      user: state.user
    };
  }

  export default connect(mapStateToProps,{deleteMaster,deletePoolCard, getSmallCards, addPoolCard, getPoolSubCard} )(MasterCard);
