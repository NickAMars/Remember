import React, {Component} from  'react';
import { connect } from 'react-redux';
import { getSmallCards } from '../../../actions';
import axios from '../../../utils/api';
import {UpdateButton, RemoveButton} from '../Buttons';

class SubCard extends Component {
  state = {
    flipped: false,
    localViews: 0,
    showUpdateModal: false,
    showDeleteConfirm: false,
    editTitle: this.props.title,
    editDescriptions: this.props.descriptions,
    updateError: '',
  }

  toggleFlip = () => {
    if (!this.state.showUpdateModal && !this.state.showDeleteConfirm) {
      const wasFlipped = this.state.flipped;
      this.setState({ flipped: !wasFlipped });
      if (!wasFlipped) {
        if (this.props.isOwner !== false) {
          axios.put(`/api/profile/MasterCard/subcards/${this.props.uuid}/view`).catch(() => {});
        } else {
          this.setState(prev => ({ localViews: prev.localViews + 1 }));
        }
      }
    }
  }

  openUpdateModal = () => {
    this.setState({
      showUpdateModal: true,
      editTitle: this.props.title,
      editDescriptions: this.props.descriptions,
      updateError: '',
    });
  }

  closeUpdateModal = () => {
    this.setState({ showUpdateModal: false });
  }

  onUpdate = async () => {
    const { uuid, masterCardUuid } = this.props;
    const { editTitle, editDescriptions } = this.state;
    try {
      await axios.put(`/api/profile/MasterCard/subcards/${uuid}`, { title: editTitle, descriptions: editDescriptions });
    } catch (err) {
      const msg = err.response ? err.response.data.error : 'Update failed';
      this.setState({ updateError: msg });
      return;
    }
    this.setState({ showUpdateModal: false, flipped: false });
    this.props.getSmallCards(masterCardUuid);
  }

  openDeleteConfirm = () => {
    this.setState({ showDeleteConfirm: true });
  }

  closeDeleteConfirm = () => {
    this.setState({ showDeleteConfirm: false });
  }

  onDelete = async () => {
    const { uuid, masterCardUuid } = this.props;
    try {
      await axios.delete(`/api/profile/MasterCard/subcards/${uuid}`);
      this.props.getSmallCards(masterCardUuid);
    } catch (err) {
      console.error('Delete failed', err);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.title !== this.props.title || prevProps.descriptions !== this.props.descriptions) {
      this.setState({ editTitle: this.props.title, editDescriptions: this.props.descriptions });
    }
  }

  render() {
    const { flipped, showUpdateModal, showDeleteConfirm, editTitle, editDescriptions } = this.state;

    return (
      <div className="container-card">
        <div className={`card ${flipped ? 'card--flipped' : ''}`}>
          <div className="card__side card__side--front" onClick={this.toggleFlip} style={{cursor:'pointer'}}>
            <div className="card__title card__title--center">{this.props.title}</div>
          </div>
          <div className="card__side card__side--back">
            {this.props.isOwner !== false && <div className="card__svg u-br-bt">
              <UpdateButton onClick={this.openUpdateModal} masterinfo={{uuid: this.props.uuid, title: this.props.title}}/>
              <RemoveButton onClick={this.openDeleteConfirm} ID={this.props.uuid} />
            </div>}
            <div className="card__description">
              {this.props.descriptions}
            </div>
            <button className="card__flip-btn card__flip-btn--back" onClick={this.toggleFlip} title="Flip card">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 1l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 11V9a4 4 0 014-4h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 23l-4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 13v2a4 4 0 01-4 4H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>

        {showDeleteConfirm && <div className="dialog-overlay" onClick={this.closeDeleteConfirm}>
          <div className="dialog dialog--sm" onClick={(e) => e.stopPropagation()}>
            <div className="dialog__header">
              <h3 className="dialog__title">Delete Card</h3>
              <button className="dialog__close" onClick={this.closeDeleteConfirm}>&times;</button>
            </div>
            <div className="dialog__body">
              <p className="dialog__confirm-text">Are you sure you want to delete "<strong>{this.props.title}</strong>"?</p>
              <div className="dialog__confirm-actions">
                <button className="dialog__confirm-btn dialog__confirm-btn--delete" onClick={this.onDelete}>Delete</button>
                <button className="dialog__confirm-btn dialog__confirm-btn--cancel" onClick={this.closeDeleteConfirm}>Cancel</button>
              </div>
            </div>
          </div>
        </div>}

        {showUpdateModal && <div className="dialog-overlay" onClick={this.closeUpdateModal}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog__header">
              <h3 className="dialog__title">Update Card</h3>
              <button className="dialog__close" onClick={this.closeUpdateModal}>&times;</button>
            </div>
            <div className="dialog__body">
              <div className="dialog__single">
                <input
                  className="dialog__input"
                  type="text"
                  placeholder="Card title"
                  maxLength="128"
                  value={editTitle}
                  onChange={(e) => this.setState({ editTitle: e.target.value })}
                />
                <textarea
                  className="dialog__textarea"
                  placeholder="Description"
                  value={editDescriptions}
                  onChange={(e) => this.setState({ editDescriptions: e.target.value })}
                />
                {this.state.updateError && <p style={{color:'#c0392b',fontSize:'1rem'}}>{this.state.updateError}</p>}
                <button className="dialog__submit" onClick={this.onUpdate}>Save</button>
              </div>
            </div>
          </div>
        </div>}
      </div>
    );
  }
}

export default connect(null, { getSmallCards })(SubCard);
