import React, {Component} from 'react';
import { connect } from 'react-redux';
import { getMyCards, fetchUser } from '../../../actions';
import axios, { errorMessage } from '../../../utils/api';
import { showToast } from '../../../utils/toast';
import { readCardsFromFile } from '../../../utils/spreadsheet';

class CreateMaster extends Component{
  constructor(props){
    super(props);
    this.state = {
      title: "",
      // Single-file mode: one parsed deck at a time
      parsedCards: [],
      fileName: "",
      // Multi-file mode: multiple files, each becomes its own deck
      parsedDecks: [],  // [{ title, cards, fileName }]
      creating: false,
    }
    this.fileInput = React.createRef();
  }

  onFileSelect = async () => {
    const files = Array.from(this.fileInput.current.files || []);
    if (files.length === 0) return;

    if (files.length === 1) {
      // Single file: keep existing behavior
      const file = files[0];
      try {
        const cards = await readCardsFromFile(file);
        if (cards.length === 0) throw new Error('No valid cards found in file');
        const nameFromFile = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
        this.setState(prev => ({ parsedCards: cards, fileName: file.name, parsedDecks: [], title: prev.title || nameFromFile }));
      } catch (error) {
        showToast(error.message || 'Could not read file');
        this.fileInput.current.value = '';
      }
    } else {
      // Multiple files: each file becomes its own deck
      const decks = [];
      const errors = [];
      for (const file of files) {
        try {
          const cards = await readCardsFromFile(file);
          if (cards.length === 0) { errors.push(file.name); continue; }
          const deckTitle = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
          decks.push({ title: deckTitle, cards, fileName: file.name });
        } catch (error) {
          errors.push(file.name);
        }
      }
      if (errors.length > 0) showToast(`Skipped ${errors.length} file${errors.length !== 1 ? 's' : ''} with no valid cards`);
      if (decks.length === 0) {
        showToast('No valid cards found in any file');
        this.fileInput.current.value = '';
        return;
      }
      this.setState({ parsedDecks: decks, parsedCards: [], fileName: '', title: '' });
    }
  }

  clearFile = () => {
    this.setState({ parsedCards: [], parsedDecks: [], fileName: '', title: '' });
    if (this.fileInput.current) this.fileInput.current.value = '';
  }

  removeDeck = (index) => {
    this.setState(prev => {
      const parsedDecks = prev.parsedDecks.filter((_, deckIndex) => deckIndex !== index);
      return { parsedDecks };
    });
  }

  renameDeck = (index, newTitle) => {
    this.setState(prev => {
      const parsedDecks = prev.parsedDecks.map((deck, deckIndex) =>
        deckIndex === index ? { ...deck, title: newTitle } : deck
      );
      return { parsedDecks };
    });
  }

  onCreate = async () => {
    const { title, parsedCards, parsedDecks } = this.state;

    // Multi-file mode
    if (parsedDecks.length > 0) {
      this.setState({ creating: true });
      const created = [];
      const failed = [];
      for (const deck of parsedDecks) {
        if (!deck.title.trim()) { failed.push(deck.fileName); continue; }
        try {
          await axios.post('/api/profile/MasterCard', { title: deck.title.trim(), cards: deck.cards });
          created.push(deck.title.trim());
        } catch (error) {
          failed.push(deck.title.trim());
        }
      }
      if (created.length > 0) showToast(`Created ${created.length} deck${created.length !== 1 ? 's' : ''}`);
      if (failed.length > 0) showToast(`Failed to create ${failed.length} deck${failed.length !== 1 ? 's' : ''}: ${failed.join(', ')}`);
      this.setState({ title: '', parsedCards: [], parsedDecks: [], fileName: '', creating: false });
      if (this.fileInput.current) this.fileInput.current.value = '';
      this.props.getMyCards('/study', { page: 0, pageSize: 10 });
      this.props.fetchUser();
      return;
    }

    // Single-file mode
    if (!title.trim()) {
      showToast('Please enter a deck title');
      return;
    }

    this.setState({ creating: true });
    try {
      await axios.post('/api/profile/MasterCard', {
        title: title.trim(),
        cards: parsedCards,
      });
      showToast(`"${title.trim()}" created with ${parsedCards.length} card${parsedCards.length !== 1 ? 's' : ''}`);
      this.setState({ title: '', parsedCards: [], parsedDecks: [], fileName: '' });
      if (this.fileInput.current) this.fileInput.current.value = '';
      this.props.getMyCards('/study', { page: 0, pageSize: 10 });
      this.props.fetchUser();
    } catch (error) {
      showToast(errorMessage(error, 'Failed to create deck'));
    } finally {
      this.setState({ creating: false });
    }
  }

  removeCard = (index) => {
    this.setState(prev => ({
      parsedCards: prev.parsedCards.filter((_, cardIndex) => cardIndex !== index),
    }));
  }

  render(){
    const { title, parsedCards, parsedDecks, fileName, creating } = this.state;
    const isMulti = parsedDecks.length > 0;
    const totalMultiCards = parsedDecks.reduce((sum, deck) => sum + deck.cards.length, 0);

    return (
      <div className="create">
        <h4 className="heading__quaternary u-sb-md">Create Main Cards</h4>

        <div className="create__contrainer">
          <div className="create__cards u-mb-sm">
            {!isMulti && <div className="create__field">
              <input onChange={(event) => this.setState({title: event.target.value})} type="text" value={title} placeholder="Enter deck title" id="title" className="input__master-title" maxLength="128" />
            </div>}

            <div className="create__upload">
              <input
                ref={this.fileInput}
                type="file"
                accept=".xlsx,.csv"
                multiple
                style={{ display: 'none' }}
                onChange={this.onFileSelect}
              />
              {!fileName && !isMulti ? (
                <button className="create__file-btn" onClick={() => this.fileInput.current.click()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                  <span>Attach Spreadsheet(s)</span>
                </button>
              ) : isMulti ? (
                <div className="create__file-info">
                  <svg className="create__file-info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span className="create__file-info-name">{parsedDecks.length} file{parsedDecks.length !== 1 ? 's' : ''}</span>
                  <span className="create__file-info-count">{totalMultiCards} total cards</span>
                  <button className="create__file-info-clear" onClick={this.clearFile} title="Remove all files">&times;</button>
                </div>
              ) : (
                <div className="create__file-info">
                  <svg className="create__file-info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span className="create__file-info-name">{fileName}</span>
                  <span className="create__file-info-count">{parsedCards.length} card{parsedCards.length !== 1 ? 's' : ''}</span>
                  <button className="create__file-info-clear" onClick={this.clearFile} title="Remove file">&times;</button>
                </div>
              )}
            </div>

            {isMulti && <div className="create__preview">
              <h5 className="create__preview-title">{parsedDecks.length} Decks to Create</h5>
              <div className="create__preview-list">
                {parsedDecks.map((deck, deckIndex) => (
                  <div key={deck.fileName} className="create__preview-card create__preview-card--deck">
                    <input
                      className="create__preview-deck-title"
                      type="text"
                      value={deck.title}
                      maxLength="128"
                      onChange={(event) => this.renameDeck(deckIndex, event.target.value)}
                    />
                    <span className="create__preview-deck-info">{deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''} &middot; {deck.fileName}</span>
                    <button className="create__preview-remove" onClick={() => this.removeDeck(deckIndex)} title="Remove deck">&times;</button>
                  </div>
                ))}
              </div>
            </div>}

            {!isMulti && parsedCards.length > 0 && <div className="create__preview">
              <h5 className="create__preview-title">Preview ({parsedCards.length} cards)</h5>
              <div className="create__preview-list">
                {parsedCards.map((card, cardIndex) => (
                  <div key={card.title} className="create__preview-card">
                    <div className="create__preview-q">
                      {card.title}
                      {card.markedForReview && <span className="create__preview-review">Review</span>}
                    </div>
                    {card.description && <div className="create__preview-a">{card.description}</div>}
                    <button className="create__preview-remove" onClick={() => this.removeCard(cardIndex)} title="Remove card">&times;</button>
                  </div>
                ))}
              </div>
            </div>}

            <div className="create__cta u-mb-sm">
              <button
                className="create__cta-btn"
                onClick={this.onCreate}
                disabled={creating || (isMulti ? parsedDecks.length === 0 : !title.trim())}
              >
                {creating ? 'Creating...' : isMulti ? `Create ${parsedDecks.length} Deck${parsedDecks.length !== 1 ? 's' : ''}` : 'Create Master Card'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(null, { getMyCards, fetchUser })(CreateMaster);
