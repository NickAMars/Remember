import React,{Component} from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
// import {Buttons} from './Buttons';
import {UpdateButton, RemoveButton } from '../Buttons'
import {CbPublic} from '../InputField';
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
    render(){
      const {title, createdAt, uuid} = this.props.masterinfo;
      const {pathname} = this.props;
      return (
            <li className="master__items">
              <div  className="master__svg ">
                {  this.props.visible &&  <UpdateButton onClick={ this.UpdateButton} masterinfo={this.props.masterinfo}/>}
                { (this.props.showCheckBox || this.props.visible) &&  <RemoveButton onClick={this.RemoveButton} ID={uuid}/>}
              </div>
            { !this.props.showCheckBox && <CbPublic  pubinfo={this.props.masterinfo} addPoolCard={pathname === '/mine'?this.props.addPoolCard:this.addPoolToMine} />}
              <Link  to={{ pathname:`/smallcards/${uuid}`, query: { prevent:pathname === '/more'? true:false  }}} className="master__links"
               onClick={()=> pathname === '/more' ?this.props.getPoolSubCard(uuid) :this.props.getSmallCards(uuid)}>

                <span className="master__title">{title}</span>
                <span className="master__date">{createdAt}</span>
              </Link>
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
      user: state.user
    };
  }

  export default connect(mapStateToProps,{deleteMaster,deletePoolCard, getSmallCards, addPoolCard, getPoolSubCard, storePoolToMaster} )(MasterCard);
