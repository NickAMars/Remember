import React, {Component} from 'react';
import {TopFiveCard} from '../Helper/Cards';
import {CreateMaster} from '../Helper/Form';
import {Chart} from  './chart';
import { connect } from 'react-redux';
import { fetchUser, getMyCard, getSmallCards } from '../../actions';

class MasterCard extends Component{
  async componentDidMount(){
   await this.props.fetchUser();
  }
  constructor(props){
    super(props);
    this.state = {
      line: null,
      data: [],
      allCards: [],
      visibleCount: 5,
      search: '',
    };
  }

  navigateToCard = (referenceID) => {
    this.props.getSmallCards(referenceID);
  }

  static getDerivedStateFromProps(props, state){
    if(props.user === null) return null;
    if(props.user){
      return { allCards: props.user.allCardsByViews || [] };
    }
    return null;
  }

  showMore = () => {
    this.setState(prev => ({ visibleCount: prev.visibleCount + 5 }));
  }

  showLess = () => {
    this.setState({ visibleCount: 5 });
  }

  render(){
    const { allCards, visibleCount, search } = this.state;
    const filtered = search
      ? allCards.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
      : allCards;
    const visible = filtered.slice(0, visibleCount);
    const chartData = allCards.slice(0, 5);
    const hasMore = visibleCount < filtered.length;

    return (
      <div>
        <div className="xcontainer-main u-mb-md">
            <div className="topcards">
              <h4 className="heading__quaternary u-mb-sm">View Cards</h4>
              <input
                className="search-cards__input"
                type="text"
                placeholder="Search master cards..."
                value={search}
                onChange={(e) => this.setState({ search: e.target.value, visibleCount: 5 })}
                maxLength="128"
              />
              <div className={`list-scroll ${visibleCount > 5 ? 'list-scroll--expanded' : ''}`}>
                <ul className="list">
                   {
                     visible.map((master, index) => {
                        return ( <TopFiveCard onNavigate={this.navigateToCard} key={master.referenceID} cards={master}/>  );
                      })
                   }
                 </ul>
              </div>
              {hasMore && <button className="show-more-btn" onClick={this.showMore}>Show More</button>}
              {!hasMore && filtered.length > 5 && <button className="show-more-btn" onClick={this.showLess}>Show Less</button>}
            </div>

              <Chart data={chartData}/>
        </div>
        <CreateMaster/>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    test: state.test,
    master_card: state.master_card,
    user: state.user
  };
}
export default connect(mapStateToProps, {fetchUser, getMyCard, getSmallCards})(MasterCard);
