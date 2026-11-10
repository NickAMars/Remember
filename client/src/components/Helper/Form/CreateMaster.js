import React, {Component} from 'react';
import { connect } from 'react-redux';
import { getMyCards, fetchUser } from '../../../actions';
import axios from '../../../utils/api';
import { showToast } from '../../../utils/toast';
import * as XLSX from 'xlsx';

class CreateMaster extends Component{
  constructor(props){
    super(props);
    this.state = {
      title: "",
      parsedCards: [],
      fileName: "",
      creating: false,
    }
    this.fileInput = React.createRef();
  }

  onFileSelect = () => {
    const file = this.fileInput.current.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      showToast('Please upload an .xlsx, .xls, or .csv file');
      this.fileInput.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        const firstCell = rows.length > 0 ? String(rows[0][0]).toLowerCase() : '';
        const startRow = (firstCell === 'title' || firstCell === 'question') ? 1 : 0;

        const cards = [];
        for (let i = startRow; i < rows.length; i++) {
          const question = String(rows[i][0] || '').trim();
          const answer = String(rows[i][1] || '').trim();
          if (question) cards.push({ title: question, description: answer });
        }

        if (cards.length === 0) {
          showToast('No valid cards found in file');
          this.fileInput.current.value = '';
          return;
        }

        // Auto-fill title from file name if empty
        const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
        this.setState({
          parsedCards: cards,
          fileName: file.name,
          title: this.state.title || baseName,
        });
      } catch (err) {
        showToast('Could not read file');
        this.fileInput.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  }

  clearFile = () => {
    this.setState({ parsedCards: [], fileName: '' });
    if (this.fileInput.current) this.fileInput.current.value = '';
  }

  onCreate = async () => {
    const { title, parsedCards } = this.state;
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
      this.setState({ title: '', parsedCards: [], fileName: '' });
      if (this.fileInput.current) this.fileInput.current.value = '';
      this.props.getMyCards('/study');
      this.props.fetchUser();
    } catch (err) {
      showToast(err.response ? err.response.data.error : 'Failed to create deck');
    } finally {
      this.setState({ creating: false });
    }
  }

  removeCard = (index) => {
    this.setState(prev => ({
      parsedCards: prev.parsedCards.filter((_, i) => i !== index),
    }));
  }

  render(){
    const { title, parsedCards, fileName, creating } = this.state;

    return (
      <div className="create">
        <h4 className="heading__quaternary u-sb-md">Create Main Cards</h4>

        <div className="create__contrainer">
          <div className="create__cards u-mb-sm">
            <div className="create__field">
              <input onChange={(event) => this.setState({title: event.target.value})} type="text" value={title} placeholder="Enter deck title" id="title" className="input__master-title" maxLength="128" />
            </div>

            <div className="create__upload">
              <input
                ref={this.fileInput}
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                onChange={this.onFileSelect}
              />
              {!fileName ? (
                <button className="create__file-btn" onClick={() => this.fileInput.current.click()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                  <span>Attach Spreadsheet</span>
                </button>
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

            {parsedCards.length > 0 && <div className="create__preview">
              <h5 className="create__preview-title">Preview ({parsedCards.length} cards)</h5>
              <div className="create__preview-list">
                {parsedCards.map((card, i) => (
                  <div key={i} className="create__preview-card">
                    <div className="create__preview-q">{card.title}</div>
                    {card.description && <div className="create__preview-a">{card.description}</div>}
                    <button className="create__preview-remove" onClick={() => this.removeCard(i)} title="Remove card">&times;</button>
                  </div>
                ))}
              </div>
            </div>}

            <div className="create__cta u-mb-sm">
              <button
                className="create__cta-btn"
                onClick={this.onCreate}
                disabled={creating || !title.trim()}
              >
                {creating ? 'Creating...' : 'Create Master Card'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(null, { getMyCards, fetchUser })(CreateMaster);
