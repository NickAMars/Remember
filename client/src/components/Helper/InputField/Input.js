import React from  'react'
import {TEXT} from '../../../constance'
export  const Input  = (props)=>{
  const {onChange, value } = props;
  return (
    <input
      autoFocus
      className="input__field"
      type={TEXT}
      onChange={onChange}
      value={value}
      maxLength="32"
    />
  );
}

// (event)=>{ this.setState({ title: event.target.value}) }
//this.state.title
