import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addPoolCard, deletePoolCard } from '../../../actions';

class CbPublic extends Component {
  findPoolCard = () => {
    const { pubinfo, poolcards, user } = this.props;
    if (!user || !poolcards) return null;
    return poolcards.find(publicDeck => publicDeck.author === user.uuid && publicDeck.title === pubinfo.title);
  }

  isPublic = () => {
    return !!this.findPoolCard();
  }

  toggle = (event) => {
    event.stopPropagation();
    const poolCard = this.findPoolCard();
    if (poolCard) {
      this.props.deletePoolCard(poolCard.uuid);
    } else {
      this.props.addPoolCard({ uuid: this.props.pubinfo.uuid });
    }
  }

  render() {
    return (
      <input
        type="checkbox"
        checked={this.isPublic()}
        onChange={this.toggle}
        className="master__checkbox"
        title="Toggle public visibility"
      />
    );
  }
}

const mapStateToProps = (state) => ({
  poolcards: state.poolcards || [],
  user: state.user,
});

export default connect(mapStateToProps, { addPoolCard, deletePoolCard })(CbPublic);
