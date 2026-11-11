import React from 'react';

const subcardSizes = [
  { label: 'S', cols: 4, height: '26rem' },
  { label: 'M', cols: 3, height: '30rem' },
  { label: 'L', cols: 2, height: '34rem' },
  { label: 'XL', cols: 1, height: '40rem' },
];

const masterSizes = [
  { label: '4', cols: 4, height: '12rem' },
  { label: '3', cols: 3, height: '14rem' },
  { label: '2', cols: 2, height: '16rem' },
  { label: '1', cols: 1, height: '10rem' },
];

export class CardSizeControl extends React.Component {
  state = { sizeIndex: this.props.variant === 'master' ? 0 : 2 }

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
      const sizeIndex = parseInt(saved, 10);
      if (sizeIndex >= 0 && sizeIndex < sizes.length) {
        this.setState({ sizeIndex: sizeIndex });
        this.applySize(sizeIndex);
      }
    } else {
      const defaultIdx = this.props.variant === 'master' ? 0 : 2;
      this.setState({ sizeIndex: defaultIdx });
      this.applySize(defaultIdx);
    }
  }

  applySize = (sizeIndex) => {
    const sizes = this.getSizes();
    const size = sizes[sizeIndex];
    if (this.props.variant === 'master') {
      document.documentElement.style.setProperty('--master-card-cols', size.cols);
      document.documentElement.style.setProperty('--master-card-height', size.height);
    } else {
      document.documentElement.style.setProperty('--card-columns', size.cols);
      document.documentElement.style.setProperty('--card-height', size.height);
    }
  }

  onChange = (event) => {
    const sizeIndex = parseInt(event.target.value, 10);
    this.setState({ sizeIndex: sizeIndex });
    this.applySize(sizeIndex);
    localStorage.setItem(this.getStorageKey(), sizeIndex);
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
