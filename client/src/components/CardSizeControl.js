import React from 'react';

const subcardSizes = [
  { label: 'S', cols: '25%', min: '14rem', height: '15rem' },
  { label: 'M', cols: '33.33%', min: '18rem', height: '19rem' },
  { label: 'L', cols: '50%', min: '22rem', height: '24rem' },
  { label: 'XL', cols: '100%', min: '100%', height: '30rem' },
];

const masterSizes = [
  { label: '4', min: '14rem', height: '12rem' },
  { label: '3', min: '20rem', height: '14rem' },
  { label: '2', min: '28rem', height: '16rem' },
  { label: '1', min: '100%', height: '10rem' },
];

export class CardSizeControl extends React.Component {
  state = { sizeIndex: 0 }

  getSizes() {
    return this.props.variant === 'master' ? masterSizes : subcardSizes;
  }

  getStorageKey() {
    return this.props.variant === 'master' ? 'masterCardSize' : 'cardSize';
  }

  componentDidMount() {
    const sizes = this.getSizes();
    const saved = localStorage.getItem(this.getStorageKey());
    if (saved !== null) {
      const idx = parseInt(saved, 10);
      if (idx >= 0 && idx < sizes.length) {
        this.setState({ sizeIndex: idx });
        this.applySize(idx);
      }
    } else {
      this.applySize(0);
    }
  }

  applySize = (idx) => {
    const sizes = this.getSizes();
    const s = sizes[idx];
    if (this.props.variant === 'master') {
      document.documentElement.style.setProperty('--master-card-min', s.min);
      document.documentElement.style.setProperty('--master-card-height', s.height);
    } else {
      document.documentElement.style.setProperty('--card-cols', s.cols);
      document.documentElement.style.setProperty('--card-min', s.min);
      document.documentElement.style.setProperty('--card-height', s.height);
    }
  }

  onChange = (e) => {
    const idx = parseInt(e.target.value, 10);
    this.setState({ sizeIndex: idx });
    this.applySize(idx);
    localStorage.setItem(this.getStorageKey(), idx);
  }

  render() {
    const { sizeIndex } = this.state;
    const sizes = this.getSizes();
    return (
      <div className="card-size-control">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="card-size-control__icon">
          <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="10" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="1" y="10" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="10" y="10" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
        <input
          type="range"
          min="0"
          max={sizes.length - 1}
          value={sizeIndex}
          onChange={this.onChange}
          className="card-size-control__slider"
        />
        <span className="card-size-control__label">
          {this.props.variant === 'master' ? `${sizes[sizeIndex].label}/row` : sizes[sizeIndex].label}
        </span>
      </div>
    );
  }
}
