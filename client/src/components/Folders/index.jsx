import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../utils/api';
import { showToast } from '../../utils/toast';

const errorText = (err, fallback) =>
  (err && err.response && err.response.data && err.response.data.error) || fallback;

class Folders extends Component {
  state = {
    folders: [],
    loading: true,
    newName: '',
    // dialog: null | { type: 'decks' | 'rename' | 'delete', folder }
    dialog: null,
    allDecks: [],
    selected: {},
    deckSearch: '',
    renameValue: '',
    saving: false,
  };

  componentDidMount() {
    document.title = 'Folders - Remember';
    this.load();
  }

  load = async () => {
    try {
      const res = await axios.get('/api/folders');
      this.setState({ folders: res.data, loading: false });
    } catch (err) {
      this.setState({ loading: false });
      showToast(errorText(err, 'Failed to load folders'));
    }
  };

  replaceFolder = (folder) => {
    this.setState(prev => ({
      folders: prev.folders.map(existing => (existing.uuid === folder.uuid ? folder : existing)),
    }));
  };

  createFolder = async (event) => {
    event.preventDefault();
    const name = this.state.newName.trim();
    if (!name) return;
    try {
      const res = await axios.post('/api/folders', { name });
      this.setState(prev => ({
        newName: '',
        folders: [...prev.folders, res.data].sort((first, second) => first.name.localeCompare(second.name)),
      }));
      showToast(`Folder "${name}" created`);
      this.openDecks(res.data);
    } catch (err) {
      showToast(errorText(err, 'Failed to create folder'));
    }
  };

  openDecks = async (folder) => {
    const selected = {};
    folder.decks.forEach(deck => { selected[deck.uuid] = true; });
    this.setState({ dialog: { type: 'decks', folder }, selected, deckSearch: '' });
    try {
      const res = await axios.get('/api/folders/decks');
      this.setState({ allDecks: res.data });
    } catch (err) {
      showToast(errorText(err, 'Failed to load your decks'));
    }
  };

  toggleDeck = (uuid) => {
    this.setState(prev => ({ selected: { ...prev.selected, [uuid]: !prev.selected[uuid] } }));
  };

  saveDecks = async () => {
    const { dialog, selected } = this.state;
    const masterCardUuids = Object.keys(selected).filter(deckUuid => selected[deckUuid]);
    this.setState({ saving: true });
    try {
      const res = await axios.put(`/api/folders/${dialog.folder.uuid}/decks`, { masterCardUuids });
      this.replaceFolder(res.data);
      this.setState({ dialog: null });
      showToast(`"${res.data.name}" now has ${res.data.decks.length} deck${res.data.decks.length === 1 ? '' : 's'}`);
    } catch (err) {
      showToast(errorText(err, 'Failed to save decks'));
    } finally {
      this.setState({ saving: false });
    }
  };

  saveRename = async (event) => {
    event.preventDefault();
    const { dialog, renameValue } = this.state;
    const name = renameValue.trim();
    if (!name) return;
    try {
      const res = await axios.put(`/api/folders/${dialog.folder.uuid}`, { name });
      this.replaceFolder(res.data);
      this.setState({ dialog: null });
    } catch (err) {
      showToast(errorText(err, 'Failed to rename folder'));
    }
  };

  confirmDelete = async () => {
    const { folder } = this.state.dialog;
    try {
      await axios.delete(`/api/folders/${folder.uuid}`);
      this.setState(prev => ({ dialog: null, folders: prev.folders.filter(existing => existing.uuid !== folder.uuid) }));
      showToast(`Folder "${folder.name}" deleted. Your decks were kept.`);
    } catch (err) {
      showToast(errorText(err, 'Failed to delete folder'));
    }
  };

  closeDialog = () => this.setState({ dialog: null });

  renderDialog() {
    const { dialog, allDecks, selected, deckSearch, renameValue, saving } = this.state;
    if (!dialog) return null;
    const { folder } = dialog;

    let title, body;
    if (dialog.type === 'decks') {
      const term = deckSearch.toLowerCase();
      const shown = term ? allDecks.filter(deck => deck.title.toLowerCase().includes(term)) : allDecks;
      const count = Object.keys(selected).filter(deckUuid => selected[deckUuid]).length;
      title = `Decks in "${folder.name}"`;
      body = (
        <>
          <input
            className="dialog__input"
            placeholder="Search your decks..."
            value={deckSearch}
            onChange={event => this.setState({ deckSearch: event.target.value })}
            autoFocus
          />
          <ul className="folders__picker">
            {shown.length === 0 && <li className="folders__empty-small">No decks found.</li>}
            {shown.map(deck => (
              <li key={deck.uuid}>
                <label className={`folders__pick ${selected[deck.uuid] ? 'folders__pick--on' : ''}`}>
                  <input type="checkbox" checked={!!selected[deck.uuid]} onChange={() => this.toggleDeck(deck.uuid)} />
                  <span className="folders__pick-title">{deck.title}</span>
                  <span className="folders__pick-count">{deck.cardCount} cards</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="dialog__confirm-actions">
            <span className="folders__selected">{count} selected</span>
            <button className="dialog__confirm-btn dialog__confirm-btn--primary" disabled={saving} onClick={this.saveDecks}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="dialog__confirm-btn dialog__confirm-btn--cancel" onClick={this.closeDialog}>Cancel</button>
          </div>
        </>
      );
    } else if (dialog.type === 'rename') {
      title = 'Rename folder';
      body = (
        <form onSubmit={this.saveRename}>
          <input className="dialog__input" value={renameValue} maxLength={255} autoFocus
            onChange={event => this.setState({ renameValue: event.target.value })} />
          <div className="dialog__confirm-actions folders__dialog-actions">
            <button type="submit" className="dialog__confirm-btn dialog__confirm-btn--primary">Save</button>
            <button type="button" className="dialog__confirm-btn dialog__confirm-btn--cancel" onClick={this.closeDialog}>Cancel</button>
          </div>
        </form>
      );
    } else {
      title = 'Delete folder';
      body = (
        <>
          <p className="dialog__confirm-text">Delete "{folder.name}"? The decks inside it are not deleted.</p>
          <div className="dialog__confirm-actions">
            <button className="dialog__confirm-btn dialog__confirm-btn--delete" onClick={this.confirmDelete}>Delete</button>
            <button className="dialog__confirm-btn dialog__confirm-btn--cancel" onClick={this.closeDialog}>Cancel</button>
          </div>
        </>
      );
    }

    return (
      <div className="dialog-overlay" onClick={this.closeDialog}>
        <div className={`dialog ${dialog.type === 'decks' ? '' : 'dialog--sm'}`} onClick={event => event.stopPropagation()}>
          <div className="dialog__header">
            <h3 className="dialog__title">{title}</h3>
            <button className="dialog__close" onClick={this.closeDialog}>&times;</button>
          </div>
          <div className="dialog__body">{body}</div>
        </div>
      </div>
    );
  }

  render() {
    const { folders, loading, newName } = this.state;
    return (
      <div className="remember folders">
        <div className="folders__head">
          <div>
            <h2 className="folders__heading">Folders</h2>
            <p className="folders__sub">Group your decks into folders, then quiz yourself on a whole folder.</p>
          </div>
          <form className="folders__create" onSubmit={this.createFolder}>
            <input
              className="folders__create-input"
              placeholder="New folder name"
              value={newName}
              maxLength={255}
              onChange={event => this.setState({ newName: event.target.value })}
            />
            <button className="folders__btn folders__btn--primary" type="submit" disabled={!newName.trim()}>Create folder</button>
          </form>
        </div>

        {loading && <p className="folders__empty">Loading...</p>}
        {!loading && folders.length === 0 && (
          <div className="folders__empty">
            <p>You don't have any folders yet.</p>
            <p>Create one above, for example "AWS SAA-C03", and add your decks to it.</p>
          </div>
        )}

        <ul className="folders__grid">
          {folders.map(folder => (
            <li key={folder.uuid} className="folders__card">
              <button className="folders__delete" title="Delete folder" onClick={(event) => { event.stopPropagation(); this.setState({ dialog: { type: 'delete', folder } }); }}>
                &times;
              </button>
              <Link to={`/folders/${folder.uuid}`} className="folders__card-link">
                <div className="folders__card-top">
                  <svg className="folders__icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                  </svg>
                  <h3 className="folders__name">{folder.name}</h3>
                </div>
                <p className="folders__meta">
                  {folder.decks.length} deck{folder.decks.length === 1 ? '' : 's'} · {folder.cardCount} card{folder.cardCount === 1 ? '' : 's'}
                </p>
              </Link>
              <div className="folders__actions">
                <button className="folders__btn" onClick={() => this.openDecks(folder)}>Edit Decks</button>
                <button className="folders__btn" onClick={() => this.setState({ dialog: { type: 'rename', folder }, renameValue: folder.name })}>Rename</button>
              </div>
            </li>
          ))}
        </ul>
        {this.renderDialog()}
      </div>
    );
  }
}

export default Folders;
