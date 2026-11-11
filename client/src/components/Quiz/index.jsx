import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from '../../utils/withRouter';
import axios from '../../utils/api';
import { showToast } from '../../utils/toast';

const errorText = (err, fallback) =>
  (err && err.response && err.response.data && err.response.data.error) || fallback;

const COUNTS = [10, 20, 50, 0]; // 0 = all
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const initialRun = {
  cards: [],
  index: 0,
  picked: null,      // multiple choice: the option the user chose
  revealed: false,   // flashcard: answer shown
  results: [],       // { card, correct, given }
};

class Quiz extends Component {
  state = {
    stage: 'setup', // setup | running | done
    folders: [],
    folderUuid: '',
    deckFilter: {}, // deck uuid -> false when left out
    count: 20,
    mode: 'choice', // choice | flash
    loading: false,
    folderName: '',
    dueCounts: null, // { total, byFolder: [{ folderUuid, folderName, count }] }
    ...initialRun,
  };

  componentDidMount() {
    document.title = 'Quiz - Remember';
    window.addEventListener('keydown', this.onKey);
    this.loadFolders();
    this.loadDueCounts();
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKey);
  }

  componentDidUpdate(prevProps) {
    const prev = prevProps.match.params.folderUuid;
    const next = this.props.match.params.folderUuid;
    if (prev !== next && next) this.setState({ folderUuid: next, deckFilter: {}, stage: 'setup' });
  }

  loadDueCounts = async () => {
    try {
      const res = await axios.get('/api/review/due');
      this.setState({ dueCounts: res.data });
    } catch {
      // silently ignore — due counts are supplemental
    }
  };

  submitResults = () => {
    const { results, mode } = this.state;
    if (results.length === 0) return;
    const payload = results.map(r => ({
      subCardUuid: r.card.uuid,
      correct: r.correct,
      mode: mode === 'choice' ? 'choice' : 'flash',
    }));
    axios.post('/api/review/results', { results: payload }).catch(() => {});
    this.loadDueCounts();
  };

  startReview = async () => {
    const { folderUuid, count } = this.state;
    if (!folderUuid) return;
    this.setState({ loading: true });
    try {
      const params = {};
      if (count) params.count = count;
      const res = await axios.get(`/api/review/due/${folderUuid}`, { params });
      this.begin(res.data.cards, res.data.folder.name);
    } catch (err) {
      showToast(errorText(err, 'No cards due for review'));
    } finally {
      this.setState({ loading: false });
    }
  };

  loadFolders = async () => {
    try {
      const res = await axios.get('/api/folders');
      const fromUrl = this.props.match.params.folderUuid;
      const usable = res.data.filter(f => f.cardCount > 0);
      const folderUuid = (fromUrl && res.data.some(f => f.uuid === fromUrl))
        ? fromUrl
        : (usable[0] ? usable[0].uuid : '');
      this.setState({ folders: res.data, folderUuid });
    } catch (err) {
      showToast(errorText(err, 'Failed to load folders'));
    }
  };

  currentFolder() {
    return this.state.folders.find(f => f.uuid === this.state.folderUuid);
  }

  includedDecks() {
    const folder = this.currentFolder();
    if (!folder) return [];
    return folder.decks.filter(d => this.state.deckFilter[d.uuid] !== false && d.cardCount > 0);
  }

  start = async () => {
    const folder = this.currentFolder();
    if (!folder) return;
    const decks = this.includedDecks();
    if (decks.length === 0) {
      showToast('Pick at least one deck with cards');
      return;
    }
    this.setState({ loading: true });
    try {
      const params = {};
      if (this.state.count) params.count = this.state.count;
      if (decks.length !== folder.decks.length) params.decks = decks.map(d => d.uuid).join(',');
      const res = await axios.get(`/api/folders/${folder.uuid}/quiz`, { params });
      this.begin(res.data.cards, res.data.folder.name);
    } catch (err) {
      showToast(errorText(err, 'Failed to start quiz'));
    } finally {
      this.setState({ loading: false });
    }
  };

  begin = (cards, folderName) => {
    this.setState({ ...initialRun, cards, folderName: folderName || this.state.folderName, stage: 'running' });
    window.scrollTo({ top: 0 });
  };

  card() {
    return this.state.cards[this.state.index];
  }

  // Multiple choice is used when the server could build options for this card.
  useChoices(card) {
    return this.state.mode === 'choice' && card && card.choices && card.choices.length > 1;
  }

  pick = (option) => {
    if (this.state.picked !== null) return;
    const card = this.card();
    const correct = option === card.answer.trim();
    this.setState(prev => ({
      picked: option,
      results: [...prev.results, { card, correct, given: option }],
    }));
  };

  grade = (correct) => {
    const card = this.card();
    this.setState(prev => ({ results: [...prev.results, { card, correct, given: null }] }), this.next);
  };

  next = () => {
    const { index, cards } = this.state;
    if (index + 1 >= cards.length) {
      this.setState({ stage: 'done' }, this.submitResults);
      window.scrollTo({ top: 0 });
    } else {
      this.setState({ index: index + 1, picked: null, revealed: false });
    }
  };

  answered() {
    return this.state.results.length > this.state.index;
  }

  onKey = (e) => {
    if (this.state.stage !== 'running') return;
    if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    const card = this.card();
    if (!card) return;
    if (this.useChoices(card)) {
      const n = parseInt(e.key, 10);
      if (!this.answered() && n >= 1 && n <= card.choices.length) this.pick(card.choices[n - 1]);
      else if (this.answered() && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); this.next(); }
    } else if (!this.state.revealed && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      this.setState({ revealed: true });
    } else if (this.state.revealed && !this.answered()) {
      if (e.key === 'y' || e.key === '1') this.grade(true);
      if (e.key === 'n' || e.key === '2') this.grade(false);
    }
  };

  quit = () => this.setState({ stage: 'done' }, this.submitResults);

  folderDueCount(folderUuid) {
    const { dueCounts } = this.state;
    if (!dueCounts || !dueCounts.byFolder) return 0;
    const entry = dueCounts.byFolder.find(f => f.folderUuid === folderUuid);
    return entry ? entry.count : 0;
  }

  renderSetup() {
    const { folders, folderUuid, count, mode, loading, deckFilter, dueCounts } = this.state;
    const folder = this.currentFolder();
    const decks = this.includedDecks();
    const available = decks.reduce((s, d) => s + d.cardCount, 0);
    const dueForFolder = this.folderDueCount(folderUuid);

    if (folders.length === 0) {
      return (
        <div className="quiz__panel quiz__empty">
          <h2 className="quiz__heading">Quiz mode</h2>
          <p>Quiz mode works on a folder of decks. You don't have any folders yet.</p>
          <Link className="folders__btn folders__btn--primary" to="/folders">Go to Folders</Link>
        </div>
      );
    }

    return (
      <div className="quiz__panel">
        <h2 className="quiz__heading">Quiz mode</h2>
        <p className="quiz__sub">Pick a folder and test yourself on the cards inside it.</p>

        <label className="quiz__label">Folder</label>
        <select className="quiz__select" value={folderUuid}
          onChange={e => this.setState({ folderUuid: e.target.value, deckFilter: {} })}>
          {folders.map(f => {
            const due = this.folderDueCount(f.uuid);
            return (
              <option key={f.uuid} value={f.uuid} disabled={f.cardCount === 0}>
                {f.name} ({f.cardCount} cards{due > 0 ? `, ${due} due` : ''})
              </option>
            );
          })}
        </select>

        {folder && folder.decks.length > 0 && <>
          <label className="quiz__label">Decks <span className="quiz__hint">click to leave one out</span></label>
          <div className="quiz__chips">
            {folder.decks.map(d => {
              const on = deckFilter[d.uuid] !== false && d.cardCount > 0;
              return (
                <button key={d.uuid} type="button" disabled={d.cardCount === 0}
                  className={`quiz__chip ${on ? 'quiz__chip--on' : ''}`}
                  onClick={() => this.setState(prev => ({ deckFilter: { ...prev.deckFilter, [d.uuid]: !on } }))}>
                  {d.title} <span className="quiz__chip-count">{d.cardCount}</span>
                </button>
              );
            })}
          </div>
        </>}

        <label className="quiz__label">Questions</label>
        <div className="quiz__segment">
          {COUNTS.map(c => (
            <button key={c} type="button"
              className={`quiz__seg ${count === c ? 'quiz__seg--on' : ''}`}
              onClick={() => this.setState({ count: c })}>
              {c === 0 ? `All (${available})` : c}
            </button>
          ))}
        </div>

        <label className="quiz__label">Mode</label>
        <div className="quiz__segment">
          <button type="button" className={`quiz__seg ${mode === 'choice' ? 'quiz__seg--on' : ''}`}
            onClick={() => this.setState({ mode: 'choice' })}>Multiple choice</button>
          <button type="button" className={`quiz__seg ${mode === 'flash' ? 'quiz__seg--on' : ''}`}
            onClick={() => this.setState({ mode: 'flash' })}>Flashcard (grade yourself)</button>
        </div>
        <p className="quiz__hint quiz__hint--block">
          {mode === 'choice'
            ? 'Wrong options are taken from other answers in the same folder. Keys 1-4 pick an answer, Enter goes to the next one.'
            : 'Read the question, think of the answer, then reveal it and mark yourself right (Y) or wrong (N).'}
        </p>

        <div className="quiz__actions">
          <button className="folders__btn folders__btn--primary quiz__start" disabled={loading || available === 0} onClick={this.start}>
            {loading ? 'Loading...' : 'Start quiz'}
          </button>
          {dueForFolder > 0 && (
            <button className="folders__btn folders__btn--success quiz__start" disabled={loading} onClick={this.startReview}>
              {loading ? 'Loading...' : `Review ${dueForFolder} due card${dueForFolder !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
        {dueCounts && dueCounts.total > 0 && (
          <p className="quiz__due-banner">
            You have <strong>{dueCounts.total}</strong> card{dueCounts.total !== 1 ? 's' : ''} due for review across your folders.
          </p>
        )}
      </div>
    );
  }

  renderRunning() {
    const { cards, index, picked, revealed, results, folderName } = this.state;
    const card = this.card();
    if (!card) return null;
    const correctSoFar = results.filter(r => r.correct).length;
    const answered = this.answered();
    const right = card.answer.trim();
    const choice = this.useChoices(card);
    const progress = ((index + (answered ? 1 : 0)) / cards.length) * 100;

    return (
      <div className="quiz__panel">
        <div className="quiz__top">
          <span>{folderName} · Question {index + 1} of {cards.length}</span>
          <span>Score {correctSoFar}/{results.length}</span>
        </div>
        <div className="quiz__bar"><div className="quiz__bar-fill" style={{ width: `${progress}%` }} /></div>

        {card.deck && <span className="quiz__deck">{card.deck}</span>}
        <p className="quiz__question">{card.question}</p>

        {choice ? (
          <ol className="quiz__options">
            {card.choices.map((opt, i) => {
              let cls = 'quiz__option';
              if (answered) {
                if (opt === right) cls += ' quiz__option--right';
                else if (opt === picked) cls += ' quiz__option--wrong';
                else cls += ' quiz__option--dim';
              }
              return (
                <li key={i}>
                  <button className={cls} disabled={answered} onClick={() => this.pick(opt)}>
                    <span className="quiz__letter">{LETTERS[i]}</span>
                    <span className="quiz__option-text">{opt}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="quiz__flash">
            {revealed
              ? <div className="quiz__answer">{right || <em>No answer saved for this card.</em>}</div>
              : <button className="folders__btn folders__btn--primary" onClick={() => this.setState({ revealed: true })}>Show answer</button>}
          </div>
        )}

        {answered && choice && (
          <p className={`quiz__feedback ${picked === right ? 'quiz__feedback--right' : 'quiz__feedback--wrong'}`}>
            {picked === right ? 'Correct!' : 'Not quite. The right answer is highlighted.'}
          </p>
        )}
        {(answered || revealed) && card.link && (
          <a className="quiz__link" href={card.link} target="_blank" rel="noopener noreferrer">Learn more</a>
        )}

        <div className="quiz__controls">
          <button className="folders__btn" onClick={this.quit}>End quiz</button>
          {choice && answered && (
            <button className="folders__btn folders__btn--primary" onClick={this.next}>
              {index + 1 >= cards.length ? 'See results' : 'Next'}
            </button>
          )}
          {!choice && revealed && !answered && <>
            <button className="folders__btn folders__btn--danger" onClick={() => this.grade(false)}>I missed it</button>
            <button className="folders__btn folders__btn--success" onClick={() => this.grade(true)}>I got it</button>
          </>}
        </div>
      </div>
    );
  }

  renderDone() {
    const { results, folderName, folderUuid } = this.state;
    const correct = results.filter(r => r.correct).length;
    const missed = results.filter(r => !r.correct);
    const pct = results.length ? Math.round((correct / results.length) * 100) : 0;

    return (
      <div className="quiz__panel">
        <h2 className="quiz__heading">Quiz results</h2>
        <p className="quiz__sub">{folderName}</p>
        <div className="quiz__score">
          <span className={`quiz__pct ${pct >= 72 ? 'quiz__pct--pass' : ''}`}>{pct}%</span>
          <span>{correct} of {results.length} correct</span>
        </div>

        <div className="quiz__controls quiz__controls--left">
          {missed.length > 0 && (
            <button className="folders__btn folders__btn--primary" onClick={() => this.begin(missed.map(r => r.card))}>
              Retry {missed.length} missed
            </button>
          )}
          <button className="folders__btn" onClick={() => this.setState({ stage: 'setup' })}>New quiz</button>
          <Link className="folders__btn" to="/folders">Back to folders</Link>
        </div>

        {missed.length > 0 && <>
          <h3 className="quiz__missed-title">Review what you missed</h3>
          <ul className="quiz__missed">
            {missed.map((r, i) => (
              <li key={i} className="quiz__missed-item">
                <p className="quiz__missed-q">{r.card.question}</p>
                {r.given && <p className="quiz__missed-given"><strong>Your answer:</strong> {r.given}</p>}
                <p className="quiz__missed-a"><strong>Correct answer:</strong> {r.card.answer}</p>
                {r.card.link && <a className="quiz__link" href={r.card.link} target="_blank" rel="noopener noreferrer">Learn more</a>}
              </li>
            ))}
          </ul>
        </>}
        {folderUuid && missed.length === 0 && results.length > 0 && <p className="quiz__sub">Perfect score. Nice work!</p>}
      </div>
    );
  }

  render() {
    const { stage } = this.state;
    return (
      <div className="remember quiz">
        {stage === 'setup' && this.renderSetup()}
        {stage === 'running' && this.renderRunning()}
        {stage === 'done' && this.renderDone()}
      </div>
    );
  }
}

export default withRouter(Quiz);
