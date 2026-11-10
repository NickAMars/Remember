import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getMyCards } from '../../../actions';
import axios from '../../../utils/api';

class CreateMaster extends Component{
  constructor(props){
    super(props);
    this.state = {
      title: "",
      uploading: false,
      uploadMsg: ""
    }
    this.fileInput = React.createRef();
  }

  onFileUpload = async () => {
    const file = this.fileInput.current.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      this.setState({ uploadMsg: 'Please upload an .xlsx, .xls, or .csv file' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.setState({ uploading: true, uploadMsg: '' });
    try {
      const res = await axios.post('/api/profile/MasterCard/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imported = res.data.imported;
      const msg = imported.map(i => `${i.title} (${i.cardCount} cards)`).join(', ');
      this.setState({ uploadMsg: 'Imported: ' + msg });
      this.props.getMyCards('/mine');
    } catch (err) {
      const errMsg = err.response ? err.response.data.error : 'Upload failed';
      this.setState({ uploadMsg: errMsg });
    } finally {
      this.setState({ uploading: false });
      this.fileInput.current.value = '';
    }
  }

  render(){
    return (
      <div className="create">
        <h4 className="heading__quaternary u-sb-md">Create Main Cards</h4>

        <div className="create__contrainer">
          <div className="create__cards u-mb-sm">
            <div className="create__field">
              <input onChange={(event) => this.setState({title: event.target.value})} type="text" value={this.state.title} placeholder="Enter card title" id="title" className="input__master-title" maxLength="32" />
            </div>

            <div className="create__cta u-mb-sm">
              <Link to={`/main/subcards/${this.state.title}`} className="create__cta-btn"> Create Master Card </Link>
            </div>
          </div>

          <div className="create__upload">
            <p className="create__upload-label">Or import from a spreadsheet</p>
            <p className="create__upload-hint">Excel or CSV with columns: Title (A), Description (B). Each sheet becomes a card deck.</p>
            <div className="create__upload-row">
              <input
                ref={this.fileInput}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="create__upload-input"
                onChange={this.onFileUpload}
                disabled={this.state.uploading}
              />
            </div>
            {this.state.uploadMsg && <p className="create__upload-msg">{this.state.uploadMsg}</p>}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(null, { getMyCards })(CreateMaster);
