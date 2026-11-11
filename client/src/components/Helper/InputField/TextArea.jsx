import React from  'react'
// import {TEXT} from '../constance'

export  const TextArea  = (props)=>{
  const {onChange, value } = props;

  return (
    <textarea
      className="input__textarea"
      name="basic" rows="5" cols="50" maxLength="200"
      onChange={onChange}
      value={value}
      >
    </textarea>
  )
}
// onChange={(event)=>{ this.setState({ description: event.target.value }) }}
  // value={this.state.description}
