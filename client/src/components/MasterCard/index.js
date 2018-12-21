import React, {Component} from 'react';
import {Header} from '../Header';
import { Link } from 'react-router-dom';
import {SmallCard} from  './smallCard';
import {Graph} from  './graph';
import { serverTest } from '../../actions';
// import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
// import TopFive from './TopFive';
class MasterCard extends Component{
  // when the component has mounted then we are going to get the cards
  // from the database with the top amount result from yesterday
  componentDidMount(){
    this.props.serverTest();
    // console.log("props",this.props);
   // call action creater which places the result into the state
  }
  constructor(props){
    super(props);
    // wnat to hold 5 cards which are the best of the user
    this.state = {
      title: "I love what i do",
      // this is just temporary values
      cards: [
              {_id: "kiss", title:"title1", date:"november 4 2018"},
              {_id: "heaven", title:"title2", date:"december 15 2018"},
              {_id: "demons", title:"title3", date:"september 30 2018"},
              {_id: "loveones", title:"title4", date:"september 26 2018"},
              {_id: "pain", title:"title5", date:"september 1 2018"}
            ]
    };
  }


  render(){
    // console.log(this.props.test);
    return (
      <div>
        <div className="header-box">
          <h1 className="heading__primary heading__primary--pink u-mt-sm ">Remember</h1>
        </div>
        < Header />

        <div className="xcontainer-main u-mb-md">
            <div className="topcards">
              <h4 className="header__quaternary u-mb-sm">Top Five Cards </h4>
              <ul className="list">
                 {
                    this.state.cards.map( function(master, index){
                      return ( <SmallCard key={master._id} cards={master}/>  );
                    })
                 }
               </ul>
            </div>

            <div className="topcards__graph">
              <Graph />
            </div>
        </div>
        <div className="create">
          <h4 className="heading__quaternary u-sb-md">Create Main Cards</h4>


          <div className="create__contrainer ">
            <div className="create__cards  u-mb-sm">
              <div className="create__field">
                <input onChange={(event) => this.setState( {title:event.target.value} )} type="text" value={this.state.title} id="title" className="input__master-title" maxLength="32" />
              </div>
              <div className="create__cta u-mb-sm">
                <Link to={`/main/subcards/${this.state.title}`} className="create__cta-btn "> Create Master Card </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    test: state.test
  };
}
export default connect(mapStateToProps, {serverTest})(MasterCard);



/*

<div className="create">
  <h4 className="heading__quaternary u-mb-md">Create Main Cards</h4>

  <input type="checkbox" id="create__checkbox" className="checkbox"/>
  <label htmlFor="create__checkbox" className="checkbox__label">
    <span className="checkbox__btn">&nbsp;</span>
  </label>


  <div className="create__contrainer ">
    <div className="create__cards  u-mb-sm">
      <div className="create__field">
        <input onChange={(event) => this.setState( {title:event.target.value} )} type="text" value={this.state.title} id="title" className="input__master-title" maxLength="32" />
      </div>
      <div className="create__cta u-mb-sm">
        <Link to={`/main/subcards/${this.state.title}`} className="create__cta-btn "> Create Master Card </Link>
      </div>
    </div>
  </div>
</div>
*/
