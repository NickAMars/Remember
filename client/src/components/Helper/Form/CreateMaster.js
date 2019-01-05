import React, {Component} from 'react';
import { Link } from 'react-router-dom';

export class CreateMaster extends Component{
  constructor(props){
    super(props);
    this.state = {
      title: "create mastercard"
    }
  }

  render(){
    return (
      <div className="create">
        <h4 className="heading__quaternary u-sb-md">Create Main Cards</h4>


        <div className="create__contrainer ">
          <div className="create__cards  u-mb-sm">

            <div className="create__field">
              <input onChange={(event) => this.setState( {title:event.target.value} )} type="text" value={this.state.title} id="title" className="input__master-title" maxLength="32" />
            </div>

            <div className="create__cta u-mb-sm">
              <Link to={`/main/subcards/${this.state.title}`} className="create__cta-btn "> Create Master Card </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
