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
      searchQuery: '',
      resetFlip: 0,
      page: 0,
      pageSize: 10,
      pieData: [],
    }
    this.fileInput = React.createRef();
    this.searchTimer = null;
  }

  fetchCards = () => {
    const masterUuid = this.props.match.params.idMaster;
    const { page, pageSize, searchQuery } = this.state;
    this.props.getSmallCards(masterUuid, { page, pageSize, search: searchQuery || undefined });
  }

  fetchPieData = () => {
    const masterUuid = this.props.match.params.idMaster;
    axios.get(`/api/profile/MasterCard/${masterUuid}/subcards/top-viewed`)
      .then(res => this.setState({ pieData: res.data || [] }))
      .catch(() => {});
  }

  async componentDidMount(){
    const masterUuid = this.props.match.params.idMaster;
    const isPool = this.props.location.query && this.props.location.query.prevent;

    if (isPool) {
      try {
        const poolRes = await axios.get('/api/poolcards');
        const poolCard = poolRes.data.find(p => p.uuid === masterUuid);
        if (poolCard) {
          let myCards = this.props.masterCards;
          if (!myCards || myCards.length === 0) {
            try {
              const myRes = await axios.get('/api/profile/MasterCard');
              myCards = myRes.data || [];
            } catch (e) { myCards = []; }
          }
          const ownCard = myCards.find(mc => mc.title === poolCard.title);
          if (ownCard) {
            this.props.getSmallCards(ownCard.uuid, { page: 0, pageSize: this.state.pageSize });
            this.props.history.replace({ pathname: `/smallcards/${ownCard.uuid}`, query: {} });
            this.setState({ masterTitle: ownCard.title, isOwner: true, prevent: false, isDefaultCard: !!ownCard.isDefault });
            this.fetchPieData();
            document.title = `${ownCard.title} - Remember`;
            this.timer = setInterval(() =>
              this.setState({ time: Date.now() - this.state.current })
            , 1);
            return;
          }
          this.setState({ masterTitle: poolCard.title });
          document.title = `${poolCard.title} - Remember`;
        }
      } catch (err) {}
      this.props.getPoolSubCard(masterUuid);
    } else {
      try {
        const res = await axios.get(`/api/profile/MasterCard/${masterUuid}`);
        this.setState({ masterTitle: res.data.title, isDefaultCard: !!res.data.isDefault });
        document.title = `${res.data.title} - Remember`;
        this.props.getSmallCards(masterUuid, { page: 0, pageSize: this.state.pageSize });
        this.fetchPieData();
      } catch (err) {
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

  setPage = (p) => {
    this.setState({ page: p }, this.fetchCards);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearchChange = (e) => {
    const searchQuery = e.target.value;
    this.setState({ searchQuery, page: 0 });
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.fetchCards();
    }, 300);
  }

  clearSearch = () => {
    this.setState({ searchQuery: '', page: 0 }, this.fetchCards);
  }

  changePageSize = (e) => {
    const size = parseInt(e.target.value, 10);
    if (size > 0) {
      this.setState({ pageSize: size, page: 0 }, this.fetchCards);
    }
  }

  pageSlots(current, total) {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i);
    const slots = [0];
    const start = Math.max(1, current - 1);
    const end = Math.min(total - 2, current + 1);
    if (start > 1) slots.push('gap');
    for (let i = start; i <= end; i++) slots.push(i);
    if (end < total - 2) slots.push('gap');
    slots.push(total - 1);
    return slots;
  }

  renderPagination(totalItems, position) {
    const { page, pageSize } = this.state;
    const totalPages = Math.ceil(totalItems / pageSize);
    if (totalPages <= 1 && position === 'top') return null;
    const slots = this.pageSlots(page, totalPages);

    return (
      <div className="pagination">
        {totalPages > 1 && <>
          <button className="pagination__btn" disabled={page === 0} onClick={() => this.setPage(0)}>&laquo;</button>
          <button className="pagination__btn" disabled={page === 0} onClick={() => this.setPage(page - 1)}>&lsaquo;</button>
          {slots.map((s, i) =>
            s === 'gap'
              ? <span key={`gap-${i}`} className="pagination__gap">&hellip;</span>
              : <button key={s} className={`pagination__btn ${s === page ? 'pagination__btn--active' : ''}`} onClick={() => this.setPage(s)}>{s + 1}</button>
          )}
          <button className="pagination__btn" disabled={page === totalPages - 1} onClick={() => this.setPage(page + 1)}>&rsaquo;</button>
          <button className="pagination__btn" disabled={page === totalPages - 1} onClick={() => this.setPage(totalPages - 1)}>&raquo;</button>
        </>}
        {position === 'bottom' && <div className="pagination__size">
          <span className="pagination__info">{totalItems} cards</span>
          <label className="pagination__size-label">
            Show
            <select className="pagination__size-select" value={pageSize} onChange={this.changePageSize}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>}
      </div>
    );
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
      this.fetchCards();
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
      this.setState({ uploadMsg: `Added ${res.data.count} cards`, dialogOpen: false, page: 0 });
      this.fetchCards();
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
    const { dialogOpen, dialogTab, title, descriptions, uploading, uploadMsg, isOwner, localViews, isDefaultCard, searchQuery } = this.state;
    const cards = this.props.showsubcards.items || this.props.showsubcards;
    const totalCards = this.props.showsubcards.total !== undefined ? this.props.showsubcards.total : (Array.isArray(this.props.showsubcards) ? this.props.showsubcards.length : 0);
    const displayCards = Array.isArray(cards) ? cards : [];
    const pieData = isOwner
      ? this.state.pieData
          .map(sc => ({ ...sc, views: sc.views + (localViews[sc.uuid] || 0) }))
          .filter(sc => sc.views > 0)
          .sort((a, b) => b.views - a.views)
      : displayCards
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
                    placeholder="Question"
                    maxLength="1000"
                    value={title}
                    onChange={(e) => this.setState({ title: e.target.value })}
                  />
                  <textarea
                    className="dialog__textarea"
                    placeholder="Answer"
                    maxLength="5000"
                    value={descriptions}
                    onChange={(e) => this.setState({ descriptions: e.target.value })}
                  />
                  <button className="dialog__submit" onClick={this.addSubCard}>Add Card</button>
                </div>
              ) : (
                <div className="dialog__upload">
                  <p className="dialog__upload-hint">Upload an Excel or CSV file. Column A = question, Column B = answer.</p>
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

        <div className="subcards-controls">
          <CardSizeControl/>
          <button className="flip-all-btn" onClick={() => this.setState(prev => ({ resetFlip: prev.resetFlip + 1 }))} title="Flip all cards back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
            </svg>
            <span>Reset Cards</span>
          </button>
        </div>
        <div className="search-bar">
          <svg className="search-bar__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="search-bar__input"
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={this.onSearchChange}
          />
          {searchQuery && <button className="search-bar__clear" onClick={this.clearSearch}>&times;</button>}
        </div>
        {this.renderPagination(totalCards, 'top')}
        <div className="row">
        {
         displayCards.map((smallcard, index) => <SubCard  key={smallcard.uuid}  {...smallcard} masterCardUuid={this.props.match.params.idMaster} isOwner={isOwner} isDefault={isDefaultCard} onView={this.onCardView} resetFlip={this.state.resetFlip} />)
        }
        </div>
        {this.renderPagination(totalCards, 'bottom')}
      </div>
    );
  }

componentWillUnmount(){
  if(!this.state.prevent){
    this.props.getMasterTime(this.props.match.params.idMaster,this.state.time);
    clearInterval( this.timer );
  }
  clearTimeout(this.searchTimer);
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
