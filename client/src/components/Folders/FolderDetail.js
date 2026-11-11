import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getSmallCards } from '../../actions';
import axios from '../../utils/api';
import { showToast } from '../../utils/toast';

const errorText = (err, fallback) =>
  (err && err.response && err.response.data && err.response.data.error) || fallback;

class FolderDetail extends Component {
  state = {
    folder: null,
    loading: true,
  };

  componentDidMount() {
    this.load();
  }

  load = async () => {
    const { folderUuid } = this.props.match.params;
    try {
      const res = await axios.get(`/api/folders/${folderUuid}`);
      this.setState({ folder: res.data, loading: false });
      document.title = `${res.data.name} - Remember`;
    } catch (err) {
      this.setState({ loading: false });
      showToast(errorText(err, 'Failed to load folder'));
    }
  };

  removeDeck = async (deckUuid, deckTitle) => {
    const { folder } = this.state;
    try {
      const res = await axios.delete(`/api/folders/${folder.uuid}/decks/${deckUuid}`);
      this.setState({ folder: res.data });
      showToast(`"${deckTitle}" removed from folder`);
    } catch (err) {
      showToast(errorText(err, 'Failed to remove deck'));
    }
  };

  render() {
    const { folder, loading } = this.state;

    if (loading) return <div className="remember"><p className="folders__empty">Loading...</p></div>;
    if (!folder) return <div className="remember"><p className="folders__empty">Folder not found.</p></div>;

    return (
      <div className="remember folders">
        <div className="folders__head">
          <div>
            <Link to="/folders" className="folders__back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              <span>Folders</span>
            </Link>
            <h2 className="folders__heading">{folder.name}</h2>
            <p className="folders__sub">
              {folder.decks.length} deck{folder.decks.length === 1 ? '' : 's'} · {folder.cardCount} card{folder.cardCount === 1 ? '' : 's'}
            </p>
          </div>
          {folder.cardCount > 0 && (
            <Link className="folders__btn folders__btn--primary" to={`/quiz/${folder.uuid}`}>Start Quiz</Link>
          )}
        </div>

        {folder.decks.length === 0 ? (
          <div className="folders__empty">
            <p>No decks in this folder yet.</p>
            <p>Go back and use "Edit Decks" to add some.</p>
          </div>
        ) : (
          <ul className="folders__grid">
            {folder.decks.map(d => (
              <li key={d.uuid} className="folders__card">
                <button
                  className="folders__delete"
                  title="Remove from folder"
                  onClick={() => this.removeDeck(d.uuid, d.title)}
                >
                  &times;
                </button>
                <Link
                  to={{ pathname: `/smallcards/${d.uuid}`, query: { prevent: false } }}
                  className="folders__card-link"
                  onClick={() => this.props.getSmallCards(d.uuid, { page: 0, pageSize: 10 })}
                >
                  <div className="folders__card-top">
                    <svg className="folders__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                    <h3 className="folders__name">{d.title}</h3>
                  </div>
                  <p className="folders__meta">{d.cardCount} card{d.cardCount === 1 ? '' : 's'}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
}

export default connect(null, { getSmallCards })(FolderDetail);
