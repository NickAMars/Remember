import React, {Component} from  'react';
import { connect } from 'react-redux';
import { getSmallCards } from '../../../actions';
import axios from '../../../utils/api';
import {UpdateButton, RemoveButton} from '../Buttons';

class SubCard extends Component {
  state = {
    flipped: false,
    editing: false,
    title: this.props.title,
    descriptions: this.props.descriptions,
  }

  toggleFlip = () => {
    if (!this.state.editing) {
      this.setState({ flipped: !this.state.flipped });
    }
  }

  onUpdate = async () => {
    const { uuid } = this.props;
    const { title, descriptions } = this.state;
    try {
      await axios.put(`/api/profile/MasterCard/subcards/${uuid}`, { title, descriptions });
      this.setState({ editing: false, flipped: false });
    } catch (err) {
      console.error('Update failed', err);
    }
  }

  onDelete = async (id) => {
    const { masterCardUuid } = this.props;
    try {
      await axios.delete(`/api/profile/MasterCard/subcards/${id}`);
      this.props.getSmallCards(masterCardUuid);
    } catch (err) {
      console.error('Delete failed', err);
    }
  }

  startEdit = () => {
    this.setState({ editing: true });
  }

  cancelEdit = () => {
    this.setState({
      editing: false,
      title: this.props.title,
      descriptions: this.props.descriptions,
    });
  }

  render() {
    const { title, descriptions, flipped, editing } = this.state;

    return (
      <div className="container-card">
        <div className={`card ${flipped ? 'card--flipped' : ''}`}>
          <div className="card__side card__side--front" onClick={this.toggleFlip} style={{cursor:'pointer'}}>
            <div className="card__title card__title--center">{this.props.title}</div>
          </div>
          <div className="card__side card__side--back">
            <div className="card__svg u-br-bt">
              <UpdateButton onClick={this.startEdit} masterinfo={{uuid: this.props.uuid, title}}/>
              <RemoveButton onClick={this.onDelete} ID={this.props.uuid} />
            </div>
            {editing ? (
              <div className="card__edit">
                <input
                  className="card__edit-input"
                  value={title}
                  onChange={(e) => this.setState({ title: e.target.value })}
                  placeholder="Title"
                />
                <textarea
                  className="card__edit-textarea"
                  value={descriptions}
                  onChange={(e) => this.setState({ descriptions: e.target.value })}
                  placeholder="Description"
                />
                <div className="card__edit-actions">
                  <button className="card__edit-btn card__edit-btn--save" onClick={this.onUpdate}>Save</button>
                  <button className="card__edit-btn card__edit-btn--cancel" onClick={this.cancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="card__description">
                {this.props.descriptions}
              </div>
            )}
            <button className="card__flip-btn card__flip-btn--back" onClick={this.toggleFlip} title="Flip card">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 1l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 11V9a4 4 0 014-4h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 23l-4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 13v2a4 4 0 01-4 4H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(null, { getSmallCards })(SubCard);
export { SubCard };
