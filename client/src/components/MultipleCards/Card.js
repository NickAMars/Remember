import React, {Component} from  'react'
import close from  '../../img/SVG/close-outline.svg'
import update from  '../../img/SVG/compose.svg'

export class Card extends Component {
  state = { flipped: false }

  toggleFlip = () => {
    this.setState({ flipped: !this.state.flipped });
  }

  render() {
    const {id, title, description} = this.props;
    const { flipped } = this.state;

    return (
      <div className="container-card">
        <div className={`card ${flipped ? 'card--flipped' : ''}`}>
          <div className="card__side  card__side--front" onClick={this.toggleFlip} style={{cursor:'pointer'}}>
            <div className="card__title card__title--center">{title}</div>
          </div>
          <div className="card__side card__side--back">
             <div className=" card__svg u-br-bt">
             <img onClick={()=>this.props.updateForm({display:true ,id, title, description })}  src={update} alt='U'/>
            <img onClick={()=>this.props.deleteCard(id)}  src={close} alt='X'/>
            </div>
            <div className="card__description">
              {description}
            </div>
            <button className="card__flip-btn card__flip-btn--back" onClick={this.toggleFlip} title="Flip back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 1l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 11V9a4 4 0 014-4h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 23l-4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 13v2a4 4 0 01-4 4H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
