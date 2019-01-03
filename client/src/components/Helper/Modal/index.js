import React from 'react';

class Modal extends React.Component {
  render() {
    if(!this.props.show) {
      return null;
    }
    return (
      <div className="modal" >
        <div className="modal-main">
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Modal;
//
// <button onClick={this.props.onClose}>
//   Close
// </button>
