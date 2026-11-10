import React, {PureComponent} from 'react';
import { connect } from 'react-redux';
import {SubCard} from '../Helper/Cards';
import {PieChart} from '../Main/PieChart';
import { getMasterTime, getSmallCards, getPoolSubCard } from '../../actions'
import axios from '../../utils/api';
import {CardSizeControl} from '../CardSizeControl';
import { showToast } from '../../utils/toast';

class SmallCards extends PureComponent{

  constructor(props){
    super(props)
    this.state = {
      time: 0,
      current: Date.now(),
      prevent: true,
      isOwner: true,
      localViews: {},
      dialogOpen: false,
      dialogTab: 'single',
      title: '',
      descriptions: '',
      uploading: false,
      uploadMsg: '',
      masterTitle: '',
      isDefaultCard: false,
    }
    this.fileInput = React.createRef();
  }
  async componentDidMount(){
    const masterUuid = this.props.match.params.idMaster;
    const isPool = this.props.location.query && this.props.location.query.prevent;

    if (isPool) {
      // Check if user has their own copy of this card
      try {
        const poolRes = await axios.get('/api/poolcards');
        const poolCard = poolRes.data.find(p => p.uuid === masterUuid);
        if (poolCard) {
          // Fetch user's own master cards to check for a match
          let myCards = this.props.masterCards;
          if (!myCards || myCards.length === 0) {
            try {
              const myRes = await axios.get('/api/profile/MasterCard');
              myCards = myRes.data || [];
            } catch (e) { myCards = []; }
          }
          const ownCard = myCards.find(mc => mc.title === poolCard.title);
          if (ownCard) {
            // Redirect to user's own card view
            this.props.getSmallCards(ownCard.uuid);
            this.props.history.replace({ pathname: `/smallcards/${ownCard.uuid}`, query: {} });
            this.setState({ masterTitle: ownCard.title, isOwner: true, prevent: false, isDefaultCard: !!ownCard.isDefault });
            this.timer = setInterval(() =>
              this.setState({ time: Date.now() - this.state.current })
            , 1);
            return;
          }
          this.setState({ masterTitle: poolCard.title });
        }
      } catch (err) {}
      this.props.getPoolSubCard(masterUuid);
    } else {
      try {
        const res = await axios.get(`/api/profile/MasterCard/${masterUuid}`);
        this.setState({ masterTitle: res.data.title, isDefaultCard: !!res.data.isDefault });
        this.props.getSmallCards(masterUuid);
      } catch (err) {
        // Not an owner card — try pool endpoint
        try {
          this.props.getPoolSubCard(masterUuid);
          const poolRes = await axios.get('/api/poolcards');
          const poolCard = poolRes.data.find(p => p.uuid === masterUuid);
          if (poolCard) {
            this.setState({ masterTitle: poolCard.title, isOwner: false, prevent: true });
          }
        } catch (e) {}
      }
    }

    this.timer = setInterval(() =>
      this.setState({ time: Date.now() - this.state.current })
    , 1)
  }
static getDerivedStateFromProps(nextProps, prevState){
  if(nextProps.location.query && nextProps.location.query.prevent){
    // Don't override if we've already redirected to own card view
    if (prevState.isOwner) return null;
    return { prevent: true, isOwner: false };
  }
  return null;
}

  onCardView = (uuid) => {
    this.setState(prev => ({
      localViews: { ...prev.localViews, [uuid]: (prev.localViews[uuid] || 0) + 1 }
    }));
  }

  openDialog = () => this.setState({ dialogOpen: true, dialogTab: 'single', title: '', descriptions: '', uploadMsg: '' });
  closeDialog = () => this.setState({ dialogOpen: false });

  addSubCard = async () => {
    const { title, descriptions } = this.state;
    if (!title.trim()) return;
    const masterUuid = this.props.match.params.idMaster;
    try {
      await axios.post(`/api/profile/MasterCard/${masterUuid}/subcards`, { title, descriptions });
      this.setState({ title: '', descriptions: '', dialogOpen: false });
      this.props.getSmallCards(masterUuid);
      showToast(`"${title}" added successfully`);
    } catch (err) {
      showToast(err.response ? err.response.data.error : 'Failed to add card');
    }
  }

  onFileUpload = async () => {
    const file = this.fileInput.current.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      this.setState({ uploadMsg: 'Please upload an .xlsx, .xls, or .csv file' });
      return;
    }
    const masterUuid = this.props.match.params.idMaster;
    const formData = new FormData();
    formData.append('file', file);
    this.setState({ uploading: true, uploadMsg: '' });
    try {
      const res = await axios.post(`/api/profile/MasterCard/${masterUuid}/subcards/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      this.setState({ uploadMsg: `Added ${res.data.count} cards`, dialogOpen: false });
      this.props.getSmallCards(masterUuid);
      showToast(`${res.data.count} cards uploaded successfully`);
    } catch (err) {
      const errMsg = err.response ? err.response.data.error : 'Upload failed';
      this.setState({ uploadMsg: errMsg });
      showToast(errMsg);
    } finally {
      this.setState({ uploading: false });
      if (this.fileInput.current) this.fileInput.current.value = '';
    }
  }

  render(){
    if(this.state.prevent)
      clearInterval( this.timer );
    const { dialogOpen, dialogTab, title, descriptions, uploading, uploadMsg, isOwner, localViews, isDefaultCard } = this.state;
    const pieData = isOwner
      ? this.props.showsubcards
          .map(sc => ({ ...sc, views: sc.views + (localViews[sc.uuid] || 0) }))
          .filter(sc => sc.views > 0)
          .sort((a, b) => b.views - a.views)
          .slice(0, 6)
      : this.props.showsubcards
          .map(sc => ({ ...sc, views: localViews[sc.uuid] || 0 }))
          .filter(sc => sc.views > 0)
          .sort((a, b) => b.views - a.views)
          .slice(0, 6);
    return (
      <div className="remember">
        {this.state.masterTitle && <div className="header-box">
          <h2 className="heading__secondary">{this.state.masterTitle}</h2>
        </div>}
        {isOwner && <div className="subcards-toolbar">
          <PieChart data={pieData}/>
          {!isDefaultCard && <button className="add-cards-btn" onClick={this.openDialog} title="Add cards">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            <span>Add Cards</span>
          </button>}
        </div>}

        {dialogOpen && <div className="dialog-overlay" onClick={this.closeDialog}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog__header">
              <h3 className="dialog__title">Add Cards</h3>
              <button className="dialog__close" onClick={this.closeDialog}>&times;</button>
            </div>
            <div className="dialog__tabs">
              <button className={`dialog__tab ${dialogTab === 'single' ? 'dialog__tab--active' : ''}`} onClick={() => this.setState({ dialogTab: 'single' })}>Single Card</button>
              <button className={`dialog__tab ${dialogTab === 'upload' ? 'dialog__tab--active' : ''}`} onClick={() => this.setState({ dialogTab: 'upload' })}>Upload File</button>
            </div>
            <div className="dialog__body">
              {dialogTab === 'single' ? (
                <div className="dialog__single">
                  <input
                    className="dialog__input"
                    type="text"
                    placeholder="Card title"
                    maxLength="128"
                    value={title}
                    onChange={(e) => this.setState({ title: e.target.value })}
                  />
                  <textarea
                    className="dialog__textarea"
                    placeholder="Description"
                    maxLength="5000"
                    value={descriptions}
                    onChange={(e) => this.setState({ descriptions: e.target.value })}
                  />
                  <button className="dialog__submit" onClick={this.addSubCard}>Add Card</button>
                </div>
              ) : (
                <div className="dialog__upload">
                  <p className="dialog__upload-hint">Upload an Excel or CSV file. Column A = title, Column B = description.</p>
                  <input
                    ref={this.fileInput}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="dialog__upload-input"
                    onChange={this.onFileUpload}
                    disabled={uploading}
                  />
                  {uploadMsg && <p className="dialog__upload-msg">{uploadMsg}</p>}
                </div>
              )}
            </div>
          </div>
        </div>}

        <CardSizeControl/>
        <hr className="u-mt-sm u-mb-sm"/>
        <div className="row">
        {
         this.props.showsubcards.map((smallcard, index) => <SubCard  key={smallcard.uuid}  {...smallcard} masterCardUuid={this.props.match.params.idMaster} isOwner={isOwner} isDefault={isDefaultCard} onView={this.onCardView} />)
        }
        </div>
      </div>
    );
  }

componentWillUnmount(){
  if(!this.state.prevent){
    this.props.getMasterTime(this.props.match.params.idMaster,this.state.time);
    clearInterval( this.timer );
  }
}

}
export const mapStateToProps = (state) => {
  return {
    smallcards: state.smallcards,
    showsubcards: state.showsubcards,
    masterCards: state.master_card || [],
  };
}

export default connect(mapStateToProps, {getMasterTime, getSmallCards, getPoolSubCard})(SmallCards);
