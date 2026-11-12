import React, {Component} from  'react';
import axios, { errorMessage } from '../../../utils/api';
import { safeHref } from '../../../utils/safeLink';
import {UpdateButton, RemoveButton} from '../Buttons';
import { showToast } from '../../../utils/toast';
import WrongAnswers from '../InputField/WrongAnswers';

class SubCard extends Component {
  titleRef = React.createRef();

  state = {
    flipped: false,
    localViews: 0,
    showUpdateModal: false,
    showDeleteConfirm: false,
    editTitle: this.props.title,
    editDescriptions: this.props.descriptions,
    editLink: this.props.link || '',
    editMarkedForReview: this.props.markedForReview || false,
    editWrongAnswers: this.props.wrongAnswers || [],
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

  toggleReview = async () => {
    const { uuid, title, descriptions, link, markedForReview, wrongAnswers } = this.props;
    try {
      await axios.put(`/api/profile/MasterCard/subcards/${uuid}`, {
        title, descriptions, link: link || '', markedForReview: !markedForReview, wrongAnswers: wrongAnswers || [],
      });
      if (this.props.onChanged) this.props.onChanged();
    } catch (error) {
      showToast(errorMessage(error, 'Failed to update review status'));
    }
  }

  openUpdateModal = () => {
    this.setState({
      showUpdateModal: true,
      editTitle: this.props.title,
      editDescriptions: this.props.descriptions,
      editLink: this.props.link || '',
      editMarkedForReview: this.props.markedForReview || false,
      editWrongAnswers: this.props.wrongAnswers || [],
      updateError: '',
    });
  }

  closeUpdateModal = () => {
    this.setState({ showUpdateModal: false });
  }

  onUpdate = async () => {
    const { uuid } = this.props;
    const { editTitle, editDescriptions, editLink, editMarkedForReview, editWrongAnswers } = this.state;
    try {
      await axios.put(`/api/profile/MasterCard/subcards/${uuid}`, {
        title: editTitle, descriptions: editDescriptions, link: editLink, markedForReview: editMarkedForReview, wrongAnswers: editWrongAnswers,
      });
    } catch (error) {
      const message = errorMessage(error, 'Update failed');
      this.setState({ updateError: message });
      showToast(message);
      return;
    }
    this.setState({ showUpdateModal: false, flipped: false });
    // Bug fix: this reloaded every card in the deck and lost the page you were on.
    if (this.props.onChanged) this.props.onChanged();
    showToast(`"${editTitle}" updated successfully`);
  }

  openDeleteConfirm = () => {
    this.setState({ showDeleteConfirm: true });
  }

  closeDeleteConfirm = () => {
    this.setState({ showDeleteConfirm: false });
  }

  onDelete = async () => {
    const { uuid } = this.props;
    try {
      await axios.delete(`/api/profile/MasterCard/subcards/${uuid}`);
      this.setState({ showDeleteConfirm: false });
      if (this.props.onChanged) this.props.onChanged();
      showToast(`"${this.props.title}" deleted successfully`);
    } catch (error) {
      showToast(errorMessage(error, `Failed to delete "${this.props.title}"`));
    }
  }

  checkOverflow = () => {
    const el = this.titleRef.current;
    if (!el) return;
    const overflows = el.scrollHeight > el.clientHeight + 2;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
    el.classList.toggle('has-overflow', overflows && !atBottom);
  }

  onTitleScroll = () => { this.checkOverflow(); }

  componentDidMount() {
    this.checkOverflow();
    if (this.titleRef.current) this.titleRef.current.addEventListener('scroll', this.onTitleScroll);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.title !== this.props.title || prevProps.descriptions !== this.props.descriptions
      || prevProps.link !== this.props.link || prevProps.markedForReview !== this.props.markedForReview
      || prevProps.wrongAnswers !== this.props.wrongAnswers) {
      this.setState({
        editTitle: this.props.title,
        editDescriptions: this.props.descriptions,
        editLink: this.props.link || '',
        editMarkedForReview: this.props.markedForReview || false,
        editWrongAnswers: this.props.wrongAnswers || [],
      });
    }
    if (prevProps.resetFlip !== this.props.resetFlip) {
      this.setState({ flipped: false });
    }
    if (prevProps.title !== this.props.title) this.checkOverflow();
  }

  componentWillUnmount() {
    if (this.titleRef.current) this.titleRef.current.removeEventListener('scroll', this.onTitleScroll);
  }

  render() {
    const { flipped, showUpdateModal, showDeleteConfirm, editTitle, editDescriptions } = this.state;
    const referenceLink = safeHref(this.props.link);

    return (
      <div className="container-card">
        <div className={`card ${flipped ? 'card--flipped' : ''}`}>
          <div className="card__side card__side--front" onClick={this.toggleFlip} style={{cursor:'pointer'}}>
            {(this.props.selectable || this.props.markedForReview) && (
              <div className="card__front-bar">
                {this.props.selectable && !this.props.markedForReview && (
                  <button
                    className={`card__select ${this.props.selected ? 'card__select--checked' : ''}`}
                    title="Select this card"
                    aria-label={`Select card: ${this.props.title}`}
                    onClick={(event) => { event.stopPropagation(); this.props.onSelect(this.props.uuid, !this.props.selected); }}
                  >
                    {this.props.selected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                )}
                {this.props.markedForReview && <span className="card__review-badge">Review</span>}
              </div>
            )}
            <div className="card__title card__title--center" ref={this.titleRef}><span className="card__title-text">{this.props.title}</span></div>
          </div>
          <div className="card__side card__side--back">
            {this.props.isOwner !== false && !this.props.isDefault && <div className="card__svg u-br-bt">
              <button
                className={`card__review-toggle ${this.props.markedForReview ? 'card__review-toggle--active' : ''}`}
                onClick={(event) => { event.stopPropagation(); this.toggleReview(); }}
                title={this.props.markedForReview ? 'Remove from review' : 'Mark for review'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={this.props.markedForReview ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                </svg>
                <span>{this.props.markedForReview ? 'Reviewing' : 'Review'}</span>
              </button>
              <UpdateButton onClick={this.openUpdateModal} masterinfo={{uuid: this.props.uuid, title: this.props.title}}/>
              <RemoveButton onClick={this.openDeleteConfirm} ID={this.props.uuid} />
            </div>}
            <div className="card__description">
              {this.props.descriptions}
            </div>
            <div className="card__back-footer">
              {referenceLink && (
                <a className="card__link" href={referenceLink} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>
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
        </div>

        {showDeleteConfirm && <div className="dialog-overlay" onClick={this.closeDeleteConfirm}>
          <div className="dialog dialog--sm" onClick={(event) => event.stopPropagation()}>
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
          <div className="dialog" onClick={(event) => event.stopPropagation()}>
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
                  onChange={(event) => this.setState({ editTitle: event.target.value })}
                />
                <textarea
                  className="dialog__textarea"
                  placeholder="Answer"
                  maxLength="5000"
                  value={editDescriptions}
                  onChange={(event) => this.setState({ editDescriptions: event.target.value })}
                />
                <input
                  className="dialog__input"
                  type="url"
                  placeholder="Reference link (optional)"
                  maxLength="2000"
                  value={this.state.editLink}
                  onChange={(event) => this.setState({ editLink: event.target.value })}
                />
                <WrongAnswers
                  answers={this.state.editWrongAnswers}
                  rightAnswer={editDescriptions}
                  onChange={(wrongAnswers) => this.setState({ editWrongAnswers: wrongAnswers })}
                />
                <button
                  type="button"
                  className={`toggle ${this.state.editMarkedForReview ? 'toggle--on' : ''}`}
                  onClick={() => this.setState(prev => ({ editMarkedForReview: !prev.editMarkedForReview }))}
                  role="switch"
                  aria-checked={this.state.editMarkedForReview}
                >
                  <span className="toggle__track"><span className="toggle__thumb" /></span>
                  <span className="toggle__label">Mark for review</span>
                </button>
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

export default SubCard;
