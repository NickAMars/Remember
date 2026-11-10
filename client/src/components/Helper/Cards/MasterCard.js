import React,{Component} from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {UpdateButton, RemoveButton } from '../Buttons'
import { deleteMaster,deletePoolCard, getSmallCards, addPoolCard, getPoolSubCard, storePoolToMaster} from '../../../actions';
import { showToast } from '../../../utils/toast';


class MasterCard extends Component{
    constructor(props){
      super(props);
      this.state = {visible: false};
    }

    static getDerivedStateFromProps(nextProps, state){
      const {masterinfo, user, pathname} = nextProps;
      if(masterinfo.author === user || pathname === '/mine') return {visible : true};
      else return {visible : false};
    }

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

    showShareBtn = () => {
      const { user, poolcards, masterinfo } = this.props;
      if (!user || !poolcards) return true;
      const userPoolCount = poolcards.filter(p => p.author === user.uuid).length;
      if (userPoolCount >= 5) {
        return poolcards.some(p => p.author === user.uuid && p.title === masterinfo.title);
      }
      return true;
    }

    isPublic = () => {
      const { user, poolcards, masterinfo } = this.props;
      if (!user || !poolcards) return false;
      return poolcards.some(p => p.author === user.uuid && p.title === masterinfo.title);
    }

    toggleShare = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const { user, poolcards, masterinfo } = this.props;
      if (!user) return;
      const poolCard = poolcards.find(p => p.author === user.uuid && p.title === masterinfo.title);
      if (poolCard) {
        this.props.deletePoolCard(poolCard.uuid);
      } else {
        const userPoolCount = poolcards.filter(p => p.author === user.uuid).length;
        if (userPoolCount === 4) {
          showToast('This is your final publicly shared card (5 of 5)');
        }
        this.props.addPoolCard({ uuid: masterinfo.uuid });
      }
    }

    render(){
      const {title, createdAt, uuid} = this.props.masterinfo;
      const {pathname, editingUuid} = this.props;
      const isOwn = this.isOwnPoolCard();
      const ownUuid = isOwn ? this.getOwnMasterUuid() : null;
      const linkUuid = ownUuid || uuid;
      const isBrowse = pathname === '/more';
      const isPoolView = isBrowse && !isOwn;
      const shared = this.isPublic();
      const isEditing = editingUuid === uuid;
      const isDisabled = editingUuid && !isEditing;
      return (
            <li className={`master__items${isEditing ? ' master__items--editing' : ''}${isDisabled ? ' master__items--disabled' : ''}`}>
              <div  className="master__svg ">
                {  this.props.visible && !this.props.masterinfo.isDefault && !editingUuid && !shared &&  <UpdateButton onClick={ this.UpdateButton} masterinfo={this.props.masterinfo}/>}
                { (this.props.showCheckBox || this.props.visible) && !this.props.masterinfo.isDefault && !editingUuid && !shared &&  <RemoveButton onClick={this.RemoveButton} ID={uuid}/>}
              </div>
              { this.props.visible && !this.props.masterinfo.isDefault && !this.props.masterinfo.isCopied && pathname !== '/more' && !editingUuid && this.showShareBtn() && (
                <button className={`master__share-btn ${shared ? 'master__share-btn--active' : ''}`} onClick={this.toggleShare} title={shared ? 'Unshare' : 'Share publicly'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </button>
              )}
              <Link  to={editingUuid ? '#' : { pathname:`/smallcards/${uuid}`, query: { prevent: isBrowse }}} className="master__links"
               onClick={(e)=> { if(editingUuid){ e.preventDefault(); return; } isBrowse ? this.props.getPoolSubCard(uuid) : this.props.getSmallCards(linkUuid); }}>

                <span className="master__title">{title}</span>
                <span className="master__date">{createdAt}</span>
              </Link>
            { pathname === '/more' && !isOwn && (
              <button className="master__copy-btn" onClick={this.addPoolToMine} title="Copy to Study">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              </button>
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
      const {uuid, title} = this.props.masterinfo;
      const {pathname} = this.props;
      if(pathname === '/more')
        this.props.deletePoolCard(uuid);
      else
        this.props.deleteMaster(uuid, title);
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
      poolcards: state.poolcards || [],
    };
  }

  export default connect(mapStateToProps,{deleteMaster,deletePoolCard, getSmallCards, addPoolCard, getPoolSubCard, storePoolToMaster} )(MasterCard);
