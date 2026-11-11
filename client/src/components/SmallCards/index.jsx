import React, {PureComponent} from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../utils/withRouter';
import {SubCard} from '../Helper/Cards';
import {PieChart} from '../Main/PieChart';
import { getMasterTime, getSmallCards, getPoolSubCard, clearSubCards } from '../../actions'
import axios, { errorMessage } from '../../utils/api';
import { MAX_UPLOAD_BYTES } from '../../constance';
import {CardSizeControl} from '../CardSizeControl';
import { showToast } from '../../utils/toast';

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DELAY_MS = 300;
const PIE_CHART_SLICES = 6;

/** One deck's cards, with paging, search, shuffle and an "add cards" dialog. */
class SmallCards extends PureComponent{

  constructor(props){
    super(props)
    this.state = {
      prevent: true,
      isOwner: true,
      localViews: {},
      dialogOpen: false,
      dialogTab: 'single',
      title: '',
      descriptions: '',
      link: '',
      uploading: false,
      uploadMsg: '',
      masterTitle: '',
      isDefaultCard: false,
      searchQuery: '',
      resetFlip: 0,
      shuffled: false,
      page: 0,
      pageSize: DEFAULT_PAGE_SIZE,
      pieData: [],
    }
    this.fileInput = React.createRef();
    this.searchTimer = null;
    // perf Increase: study time is the gap between two timestamps. This used to be a
    // setInterval that re-rendered the whole page every millisecond.
    this.studyStartedAt = null;
    // The deck whose cards are on screen (changes when a public deck turns out to be yours).
    this.deckUuid = props.match.params.idMaster;
  }

  fetchCards = () => {
    if (!this.state.isOwner) {
      this.props.getPoolSubCard(this.deckUuid);
      return;
    }
    const { page, pageSize, searchQuery, shuffled } = this.state;
    this.props.getSmallCards(this.deckUuid, { page, pageSize, search: searchQuery || undefined, shuffle: shuffled });
  }

  fetchPieData = () => {
    axios.get(`/api/profile/MasterCard/${this.deckUuid}/subcards/top-viewed`)
      .then(response => this.setState({ pieData: response.data || [] }))
      .catch(() => {});
  }

  /** Show one of the user's own decks and start timing the study session. */
  openOwnDeck = (deck) => {
    this.deckUuid = deck.uuid;
    this.setState({ masterTitle: deck.title, isOwner: true, prevent: false, isDefaultCard: !!deck.isDefault });
    document.title = `${deck.title} - Remember`;
    this.props.getSmallCards(deck.uuid, { page: 0, pageSize: this.state.pageSize });
    this.fetchPieData();
    this.studyStartedAt = Date.now();
  }

  /** Show a public deck someone else shared (read only, not timed). */
  openPublicDeck = async (publicDeckUuid) => {
    this.props.getPoolSubCard(publicDeckUuid);
    try {
      // perf Increase: ask for this one deck's title instead of downloading every public deck.
      const { data: publicDeck } = await axios.get(`/api/poolcards/${publicDeckUuid}/summary`);
      this.setState({ masterTitle: publicDeck.title, isOwner: false, prevent: true });
      document.title = `${publicDeck.title} - Remember`;
      return publicDeck;
    } catch {
      return null;
    }
  }

  /** If the user already has a deck with this title (their own shared deck), return it. */
  findOwnDeckByTitle = async (title) => {
    try {
      // perf Increase: a title search instead of loading every deck the user has.
      const { data } = await axios.get('/api/profile/MasterCard', { params: { search: title, page: 0, pageSize: 100 } });
      return (data.items || []).find(deck => deck.title === title) || null;
    } catch {
      return null;
    }
  }

  async componentDidMount(){
    const routeUuid = this.props.match.params.idMaster;
    const cameFromBrowse = this.props.location.state && this.props.location.state.prevent;
    // Don't flash the previous deck's cards while this one loads.
    this.props.clearSubCards();

    if (cameFromBrowse) {
      const publicDeck = await this.openPublicDeck(routeUuid);
      const ownDeck = publicDeck && publicDeck.author === (this.props.user && this.props.user.uuid)
        ? await this.findOwnDeckByTitle(publicDeck.title)
        : null;
      if (ownDeck) {
        this.props.history.replace(`/smallcards/${ownDeck.uuid}`);
        this.openOwnDeck(ownDeck);
      }
      return;
    }

    try {
      const { data: deck } = await axios.get(`/api/profile/MasterCard/${routeUuid}`);
      this.openOwnDeck(deck);
    } catch {
      // Not one of the user's decks: it may be a public deck opened from a shared link.
      await this.openPublicDeck(routeUuid);
    }
  }

static getDerivedStateFromProps(nextProps, prevState){
  if(nextProps.location.state && nextProps.location.state.prevent){
    if (prevState.isOwner) return null;
    return { prevent: true, isOwner: false };
  }
  return null;
}

  onCardView = (uuid, title) => {
    this.setState(prev => ({
      localViews: { ...prev.localViews, [uuid]: { count: ((prev.localViews[uuid] || {}).count || 0) + 1, title: title || (prev.localViews[uuid] || {}).title || '' } }
    }));
  }

  /** Called by a card after it is edited or deleted, so the current page reloads. */
  onCardChanged = () => {
    this.fetchCards();
    this.fetchPieData();
  }

  shuffleCards = () => {
    this.setState(prev => ({ shuffled: !prev.shuffled, page: 0 }), this.fetchCards);
  }

  setPage = (pageNumber) => {
    this.setState({ page: pageNumber }, this.fetchCards);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearchChange = (event) => {
    const searchQuery = event.target.value;
    this.setState({ searchQuery, page: 0 });
    clearTimeout(this.searchTimer);
    // perf Increase: wait until typing pauses before asking the server.
    this.searchTimer = setTimeout(this.fetchCards, SEARCH_DELAY_MS);
  }

  clearSearch = () => {
    this.setState({ searchQuery: '', page: 0 }, this.fetchCards);
  }

  changePageSize = (event) => {
    const size = parseInt(event.target.value, 10);
    if (size > 0) {
      this.setState({ pageSize: size, page: 0 }, this.fetchCards);
    }
  }

  /** Page buttons to show: first, last, and the pages around the current one, with gaps. */
  pageSlots(currentPage, totalPages) {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, pageNumber) => pageNumber);
    const slots = [0];
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages - 2, currentPage + 1);
    if (start > 1) slots.push('gap');
    for (let pageNumber = start; pageNumber <= end; pageNumber++) slots.push(pageNumber);
    if (end < totalPages - 2) slots.push('gap');
    slots.push(totalPages - 1);
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
          {slots.map((slot, slotIndex) =>
            slot === 'gap'
              ? <span key={`gap-${slotIndex}`} className="pagination__gap">&hellip;</span>
              : <button key={slot} className={`pagination__btn ${slot === page ? 'pagination__btn--active' : ''}`} onClick={() => this.setPage(slot)}>{slot + 1}</button>
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

  openDialog = () => this.setState({ dialogOpen: true, dialogTab: 'single', title: '', descriptions: '', link: '', uploadMsg: '' });
  closeDialog = () => this.setState({ dialogOpen: false });

  addSubCard = async () => {
    const { title, descriptions, link } = this.state;
    if (!title.trim()) return;
    try {
      await axios.post(`/api/profile/MasterCard/${this.deckUuid}/subcards`, { title, descriptions, link });
      this.setState({ title: '', descriptions: '', link: '', dialogOpen: false });
      this.fetchCards();
      showToast(`"${title}" added successfully`);
    } catch (error) {
      showToast(errorMessage(error, 'Failed to add card'));
    }
  }

  onFileSelect = () => {
    const file = this.fileInput.current.files[0];
    if (!file) return;
    const extension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'csv'].includes(extension)) {
      const message = extension === 'xls'
        ? 'Old .xls files are not supported. Open it in Excel and save as .xlsx.'
        : 'Please upload an .xlsx or .csv file';
      this.setState({ uploadMsg: message, selectedFileName: '' });
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      this.setState({ uploadMsg: 'File is too large (5 MB max)', selectedFileName: '' });
      return;
    }
    this.setState({ selectedFileName: file.name, uploadMsg: '' });
  }

  cancelFileSelect = () => {
    this.setState({ selectedFileName: '', uploadMsg: '' });
    if (this.fileInput.current) this.fileInput.current.value = '';
  }

  onFileUpload = async () => {
    const file = this.fileInput.current.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    this.setState({ uploading: true, uploadMsg: '' });
    try {
      const response = await axios.post(`/api/profile/MasterCard/${this.deckUuid}/subcards/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const { added, updated, count } = response.data;
      const parts = [];
      if (added > 0) parts.push(`${added} added`);
      if (updated > 0) parts.push(`${updated} updated`);
      const message = parts.join(', ') || `${count} cards processed`;
      this.setState({ uploadMsg: message, dialogOpen: false, page: 0, selectedFileName: '' }, this.fetchCards);
      showToast(message);
    } catch (error) {
      const message = errorMessage(error, 'Upload failed');
      this.setState({ uploadMsg: message });
      showToast(message);
    } finally {
      this.setState({ uploading: false });
      if (this.fileInput.current) this.fileInput.current.value = '';
    }
  }

  render(){
    const { dialogOpen, dialogTab, title, descriptions, uploading, uploadMsg, isOwner, localViews, isDefaultCard, searchQuery } = this.state;
    const { items: displayCards, total: totalCards } = this.props.showsubcards;
    let pieData;
    if (isOwner) {
      const viewsByCard = new Map();
      // Start with the server's most viewed cards, plus flips from this visit.
      for (const card of this.state.pieData) {
        const localView = localViews[card.uuid];
        viewsByCard.set(card.uuid, { ...card, views: card.views + (localView ? localView.count : 0) });
      }
      // Add cards flipped this visit that the server hasn't counted yet.
      for (const [cardUuid, localView] of Object.entries(localViews)) {
        if (!viewsByCard.has(cardUuid)) {
          viewsByCard.set(cardUuid, { uuid: cardUuid, title: localView.title, views: localView.count });
        }
      }
      pieData = Array.from(viewsByCard.values());
    } else {
      pieData = displayCards.map(card => ({ ...card, views: (localViews[card.uuid] ? localViews[card.uuid].count : 0) }));
    }
    pieData = pieData
      .filter(card => card.views > 0)
      .sort((first, second) => second.views - first.views)
      .slice(0, PIE_CHART_SLICES);
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
          <div className="dialog" onClick={(event) => event.stopPropagation()}>
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
                    onChange={(event) => this.setState({ title: event.target.value })}
                  />
                  <textarea
                    className="dialog__textarea"
                    placeholder="Answer"
                    maxLength="5000"
                    value={descriptions}
                    onChange={(event) => this.setState({ descriptions: event.target.value })}
                  />
                  <input
                    className="dialog__input"
                    type="url"
                    placeholder="Reference link (optional)"
                    maxLength="2000"
                    value={this.state.link || ''}
                    onChange={(event) => this.setState({ link: event.target.value })}
                  />
                  <button className="dialog__submit" onClick={this.addSubCard}>Add Card</button>
                </div>
              ) : (
                <div className="dialog__upload">
                  <p className="dialog__upload-hint">Upload an Excel or CSV file. Column A = question, Column B = answer, Column C = link (optional).</p>
                  <input
                    ref={this.fileInput}
                    type="file"
                    accept=".xlsx,.csv"
                    className="dialog__upload-native"
                    onChange={this.onFileSelect}
                    disabled={uploading}
                  />
                  {!this.state.selectedFileName ? (
                    <button className="dialog__upload-btn" onClick={() => this.fileInput.current.click()} disabled={uploading}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span>Choose File</span>
                    </button>
                  ) : (
                    <div className="dialog__upload-selected">
                      <span className="dialog__upload-file">{this.state.selectedFileName}</span>
                      <div className="dialog__upload-actions">
                        <button className="dialog__submit" onClick={this.onFileUpload} disabled={uploading}>
                          {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                        <button className="dialog__confirm-btn dialog__confirm-btn--cancel" onClick={this.cancelFileSelect} disabled={uploading}>Cancel</button>
                      </div>
                    </div>
                  )}
                  {uploadMsg && <p className="dialog__upload-msg">{uploadMsg}</p>}
                </div>
              )}
            </div>
          </div>
        </div>}

        <div className="subcards-controls">
          <CardSizeControl/>
          {isOwner && <button className="flip-all-btn" onClick={this.shuffleCards} title={this.state.shuffled ? 'Unshuffle cards' : 'Shuffle cards'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>
            </svg>
            <span>{this.state.shuffled ? 'Unshuffle' : 'Shuffle'}</span>
          </button>}
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
         displayCards.map((card) => <SubCard key={card.uuid} {...card} masterCardUuid={this.deckUuid} isOwner={isOwner} isDefault={isDefaultCard} onView={this.onCardView} onChanged={this.onCardChanged} resetFlip={this.state.resetFlip} />)
        }
        </div>
        {this.renderPagination(totalCards, 'bottom')}
      </div>
    );
  }

componentWillUnmount(){
  // Bug fix: time was only saved when the page's "prevent" flag happened to be false, and it
  // was counted for public decks too. Now only the user's own decks are timed.
  if (this.studyStartedAt !== null) {
    this.props.getMasterTime(this.deckUuid, Date.now() - this.studyStartedAt);
  }
  clearTimeout(this.searchTimer);
}

}
export const mapStateToProps = (state) => {
  return {
    user: state.user,
    showsubcards: state.showsubcards,
  };
}

export default withRouter(connect(mapStateToProps, {getMasterTime, getSmallCards, getPoolSubCard, clearSubCards})(SmallCards));
