import React,{Component} from 'react'
import { connect } from 'react-redux'
import  {MasterCard} from '../Helper/Cards'
import {MasterForm,SearchBar} from '../Helper/Form'
import {CardSizeControl} from '../CardSizeControl'
import {showMasterForm, getMyCards, getPoolCards} from '../../actions';

class Mine extends Component{
  constructor(props){
    super(props)
    this.state ={
      visible: false,
      search: "",
      title: "",
      uuid:"",
      page: 0,
      pageSize: 10,
    }
    this.searchTimer = null;
  }

  componentDidMount(){
    this.props.getPoolCards();
    if (this.props.pathname === '/study') {
      this.fetchStudyCards();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.pathname !== this.props.pathname && this.props.pathname === '/study') {
      this.fetchStudyCards();
    }
  }

  fetchStudyCards = () => {
    const { page, pageSize, search } = this.state;
    this.props.getMyCards(this.props.pathname, { page, pageSize, search: search || undefined });
  }

  getCards() {
    const { pathname, master, poolcards } = this.props;
    if (pathname === '/study') {
      return master && master.items ? master.items : (Array.isArray(master) ? master : []);
    } else if (pathname === '/browse') {
      return poolcards || [];
    }
    return [];
  }

  getTotal() {
    const { pathname, master, poolcards } = this.props;
    if (pathname === '/study') {
      return master && master.total !== undefined ? master.total : this.getCards().length;
    }
    // Browse: client-side filtering
    const cards = poolcards || [];
    if (!this.state.search) return cards.length;
    return cards.filter(card => card.title.toLowerCase().includes(this.state.search.toLowerCase())).length;
  }

poolCardMatchUser(poolcard){
  if(this.props.user !== null)
  if(this.props.user.uuid === poolcard.author)
    return true;
  else
    return false;
}

setPage = (pageNumber) => {
  this.setState({ page: pageNumber }, () => {
    if (this.props.pathname === '/study') this.fetchStudyCards();
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onSearch = (search) => {
  this.setState({ search, page: 0 });
  if (this.props.pathname === '/study') {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.fetchStudyCards();
    }, 300);
  }
}

changePageSize = (event) => {
  const size = parseInt(event.target.value, 10);
  if (size > 0) {
    this.setState({ pageSize: size, page: 0 }, () => {
      if (this.props.pathname === '/study') this.fetchStudyCards();
    });
  }
}

pageSlots(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, pageNumber) => pageNumber);
  const slots = [0];
  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);
  if (start > 1) slots.push('gap');
  for (let pageNumber = start; pageNumber <= end; pageNumber++) slots.push(pageNumber);
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
        {slots.map((slot, slotIndex) =>
          slot === 'gap'
            ? <span key={`gap-${slotIndex}`} className="pagination__gap">&hellip;</span>
            : <button key={slot} className={`pagination__btn ${slot === page ? 'pagination__btn--active' : ''}`} onClick={() => this.setPage(slot)}>{slot + 1}</button>
        )}
        <button className="pagination__btn" disabled={page === totalPages - 1} onClick={() => this.setPage(page + 1)}>&rsaquo;</button>
        <button className="pagination__btn" disabled={page === totalPages - 1} onClick={() => this.setPage(totalPages - 1)}>&raquo;</button>
      </>}
      {position === 'bottom' && <div className="pagination__size">
        <span className="pagination__info">{totalItems} decks</span>
        <label className="pagination__size-label">
          Show
          <select className="pagination__size-select" value={pageSize} onChange={this.changePageSize}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </label>
      </div>}
    </div>
  );
}

 render(){
    const {visible, uuid, title, page, pageSize} = this.state;
    const {pathname} = this.props;
    const total = this.getTotal();

    // For study: server handles pagination/search. For browse: client-side.
    let displayCards;
    if (pathname === '/study') {
      displayCards = this.getCards();
    } else {
      const allCards = this.getCards();
      const filtered = this.state.search
        ? allCards.filter(elem => elem.title.toLowerCase().includes(this.state.search.toLowerCase()))
        : allCards;
      displayCards = filtered.slice(page * pageSize, (page + 1) * pageSize);
    }

   return (
     <div className="remember">
       <SearchBar onSearch={this.onSearch}/>
       <div style={{ visibility: visible ? 'visible' : 'hidden' }}>
         <MasterForm title={title} _id={uuid} toggleMasterForm ={this.toggleMasterForm}/>
       </div>
       <CardSizeControl variant="master"/>
       {this.renderPagination(total, 'top')}
       <div className="master">
         <ul className="master__container">
          {
            displayCards.map(elem =>
             <MasterCard
             key={elem.uuid}
             masterinfo={elem}
             visible={this.props.visible}
             showMasterForm={this.showMasterForm}
             toggleMasterForm={this.toggleMasterForm}
             pathname={pathname}
             showCheckBox={this.poolCardMatchUser(elem)}
             editingUuid={visible ? uuid : null}
             />
           )
          }
         </ul>
       </div>
       {this.renderPagination(total, 'bottom')}
     </div>
   );
 }
 showMasterForm  = (uuid,title) => {
   this.setState({title, uuid});
 }
 toggleMasterForm = () =>{
   this.setState({visible:!this.state.visible});
 }

 componentWillUnmount() {
   clearTimeout(this.searchTimer);
 }
}
const mapStateToProps = (state) => {
  return {
    poolcards: state.poolcards,
    master: state.master_card,
    user: state.user
  };
}

export default connect(mapStateToProps,{showMasterForm, getMyCards, getPoolCards})(Mine);
