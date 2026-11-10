import React,{Component} from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
// import {Buttons} from './Buttons';
import {UpdateButton, RemoveButton } from '../Buttons'
import CbPublic from '../InputField/CbPublic';
import { deleteMaster,deletePoolCard, getSmallCards, addPoolCard, getPoolSubCard, storePoolToMaster} from '../../../actions';


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
    isOwnPoolCard = () => {
      const { pathname, masterinfo, user } = this.props;
      return pathname === '/more' && user && user.uuid === masterinfo.author;
    }

    getOwnMasterUuid = () => {
      const { masterinfo, masterCards } = this.props;
      if (!masterCards) return null;
      const match = masterCards.find(mc => mc.title === masterinfo.title);
      return match ? match.uuid : null;
    }

    render(){
      const {title, createdAt, uuid} = this.props.masterinfo;
      const {pathname} = this.props;
      const isOwn = this.isOwnPoolCard();
      const ownUuid = isOwn ? this.getOwnMasterUuid() : null;
      const linkUuid = ownUuid || uuid;
      const isPoolView = pathname === '/more' && !isOwn;
      return (
            <li className="master__items">
              <div  className="master__svg ">
                {  this.props.visible &&  <UpdateButton onClick={ this.UpdateButton} masterinfo={this.props.masterinfo}/>}
                { (this.props.showCheckBox || this.props.visible) &&  <RemoveButton onClick={this.RemoveButton} ID={uuid}/>}
              </div>
              <Link  to={{ pathname:`/smallcards/${linkUuid}`, query: { prevent: isPoolView }}} className="master__links"
               onClick={()=> isPoolView ? this.props.getPoolSubCard(uuid) : this.props.getSmallCards(linkUuid)}>

                <span className="master__title">{title}</span>
                <span className="master__date">{createdAt}</span>
              </Link>
            { !this.props.showCheckBox && (
              <div className="master__checkbox-wrap" data-tooltip="Public">
                <CbPublic  pubinfo={this.props.masterinfo} />
              </div>
            )}
            </li>
          );
    }
    UpdateButton  = () => {
      const {uuid,title} = this.props.masterinfo;
      this.props.showMasterForm(uuid,title);
      this.props.toggleMasterForm();
    }
    RemoveButton  = () => {
      const {uuid} = this.props.masterinfo;
      const {pathname} = this.props;
      // console.log(pathname)
      if(pathname === '/more')
        this.props.deletePoolCard(uuid);
      else
        this.props.deleteMaster(uuid);
    }
    addPoolToMine  = () => {
      const {uuid} = this.props.masterinfo;
      this.props.storePoolToMaster(uuid);
    }
  }

const mapStateToProps = (state) => {
    return {
      user: state.user,
      masterCards: state.master_card || [],
    };
  }

  export default connect(mapStateToProps,{deleteMaster,deletePoolCard, getSmallCards, addPoolCard, getPoolSubCard, storePoolToMaster} )(MasterCard);
