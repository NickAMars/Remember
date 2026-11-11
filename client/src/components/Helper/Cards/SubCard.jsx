import React, {Component} from  'react';
import { connect } from 'react-redux';
import { getSmallCards } from '../../../actions';
import axios from '../../../utils/api';
import {UpdateButton, RemoveButton} from '../Buttons';
import { showToast } from '../../../utils/toast';

class SubCard extends Component {
  state = {
    flipped: false,
    localViews: 0,
    showUpdateModal: false,
    showDeleteConfirm: false,
    editTitle: this.props.title,
    editDescriptions: this.props.descriptions,
    editLink: this.props.link || '',
    updateError: '',
  }

  toggleFlip = () => {
    if (!this.state.showUpdateModal && !this.state.showDeleteConfirm) {
      const wasFlipped = this.state.flipped;
      this.setState({ flipped: !wasFlipped });
      if (!wasFlipped) {
        if (this.props.isOwner !== false) {
          axios.put(`/api/profile/MasterCard/subcards/${this.props.uuid}/view`).catch(() => {});
        }
        if (this.props.onView) {
          this.props.onView(this.props.uuid, this.props.title);
        }
      }
    }
  }

  openUpdateModal = () => {
    this.setState({
      showUpdateModal: true,
      editTitle: this.props.title,
      editDescriptions: this.props.descriptions,
      editLink: this.props.link || '',
      updateError: '',
    });
  }

  closeUpdateModal = () => {
    this.setState({ showUpdateModal: false });
  }

  onUpdate = async () => {
    const { uuid, masterCardUuid } = this.props;
    const { editTitle, editDescriptions, editLink } = this.state;
    try {
      await axios.put(`/api/profile/MasterCard/subcards/${uuid}`, { title: editTitle, descriptions: editDescriptions, link: editLink });
    } catch (err) {
      const msg = err.response ? err.response.data.error : 'Update failed';
      this.setState({ updateError: msg });
      showToast(msg);
      return;
    }
    this.setState({ showUpdateModal: false, flipped: false });
    this.props.getSmallCards(masterCardUuid);
    showToast(`"${editTitle}" updated successfully`);
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
      showToast(`"${this.props.title}" deleted successfully`);
    } catch (err) {
      showToast(err.response ? err.response.data.error : `Failed to delete "${this.props.title}"`);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.title !== this.props.title || prevProps.descriptions !== this.props.descriptions || prevProps.link !== this.props.link) {
      this.setState({ editTitle: this.props.title, editDescriptions: this.props.descriptions, editLink: this.props.link || '' });
    }
    if (prevProps.resetFlip !== this.props.resetFlip) {
      this.setState({ flipped: false });
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
            {this.props.isOwner !== false && !this.props.isDefault && <div className="card__svg u-br-bt">
              <UpdateButton onClick={this.openUpdateModal} masterinfo={{uuid: this.props.uuid, title: this.props.title}}/>
              <RemoveButton onClick={this.openDeleteConfirm} ID={this.props.uuid} />
            </div>}
            <div className="card__description">
              {this.props.descriptions}
            </div>
            {this.props.link && (
              <a className="card__link" href={this.props.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                <span>Reference Link</span>
              </a>
            )}
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
                  placeholder="Question"
                  maxLength="1000"
                  value={editTitle}
                  onChange={(e) => this.setState({ editTitle: e.target.value })}
                />
                <textarea
                  className="dialog__textarea"
                  placeholder="Answer"
                  maxLength="5000"
                  value={editDescriptions}
                  onChange={(e) => this.setState({ editDescriptions: e.target.value })}
                />
                <input
                  className="dialog__input"
                  type="url"
                  placeholder="Reference link (optional)"
                  maxLength="2000"
                  value={this.state.editLink}
                  onChange={(e) => this.setState({ editLink: e.target.value })}
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
