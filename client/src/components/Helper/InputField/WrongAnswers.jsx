import React, { Component } from 'react';
import { MAX_WRONG_ANSWERS } from '../../../utils/wrongAnswers';

/**
 * Add and remove a card's wrong answers (similar but incorrect). Multiple-choice quizzes
 * show the right answer plus 3 of these; other cards' answers fill in when there are fewer.
 * Controlled: the parent keeps the list and gets every change through onChange.
 */
class WrongAnswers extends Component {
  state = { draft: '', problem: '' };

  addDraft = () => {
    const answers = this.props.answers || [];
    const answerText = this.state.draft.trim();
    if (!answerText) return;
    const lowered = answerText.toLowerCase();
    if (lowered === String(this.props.rightAnswer || '').trim().toLowerCase()) {
      this.setState({ problem: 'That is the right answer. Add something similar but incorrect.' });
      return;
    }
    if (answers.some((existing) => existing.toLowerCase() === lowered)) {
      this.setState({ problem: 'That wrong answer is already in the list.' });
      return;
    }
    if (answers.length >= MAX_WRONG_ANSWERS) {
      this.setState({ problem: `A card can have at most ${MAX_WRONG_ANSWERS} wrong answers.` });
      return;
    }
    this.props.onChange([...answers, answerText]);
    this.setState({ draft: '', problem: '' });
  };

  removeAt = (removeIndex) => {
    const answers = this.props.answers || [];
    this.props.onChange(answers.filter((_answer, answerIndex) => answerIndex !== removeIndex));
    this.setState({ problem: '' });
  };

  onKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addDraft();
    }
  };

  render() {
    const answers = this.props.answers || [];
    const { draft, problem } = this.state;
    const isFull = answers.length >= MAX_WRONG_ANSWERS;

    return (
      <div className="wrong-answers">
        <div className="wrong-answers__header">
          <span className="wrong-answers__label">Wrong answers (optional)</span>
          <span className="wrong-answers__count">{answers.length}/{MAX_WRONG_ANSWERS}</span>
        </div>
        <p className="wrong-answers__hint">
          Similar but incorrect answers. The quiz shows the right answer plus 3 of these.
        </p>
        <div className="wrong-answers__add">
          <input
            className="dialog__input"
            type="text"
            placeholder={isFull ? 'List is full' : 'Type a wrong answer and press Enter'}
            maxLength="5000"
            value={draft}
            disabled={isFull}
            onChange={(event) => this.setState({ draft: event.target.value, problem: '' })}
            onKeyDown={this.onKeyDown}
            aria-label="New wrong answer"
          />
          <button type="button" className="wrong-answers__add-btn" onClick={this.addDraft} disabled={isFull || !draft.trim()}>
            Add
          </button>
        </div>
        {problem && <p className="wrong-answers__problem">{problem}</p>}
        {answers.length > 0 && (
          <ul className="wrong-answers__list">
            {answers.map((answer, answerIndex) => (
              <li className="wrong-answers__item" key={`${answerIndex}-${answer}`}>
                <span className="wrong-answers__text">{answer}</span>
                <button
                  type="button"
                  className="wrong-answers__remove"
                  onClick={() => this.removeAt(answerIndex)}
                  title="Remove this wrong answer"
                  aria-label={`Remove wrong answer: ${answer}`}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
}

export default WrongAnswers;
