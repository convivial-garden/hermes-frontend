import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import { BACKEND } from './transportFunctions';

const CUSTOMER_ENDPOINT = `${BACKEND}customers/`;

class AddCustomerForm extends Component {
  constructor(props) {
    super(props);

    this.handleEmail = this.handleEmail.bind(this);
    this.handleName = this.handleName.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.postNewUser = this.postNewUser.bind(this);
  }

  state = {
    name: '',
    email: '',
    is_staff: false,
  };

  handleEmail(event) {
    this.setState({ email: event.target.value });
  }

  handleName(event) {
    this.setState({ name: event.target.value });
  }

  handleCheck(event) {
    this.setState({ is_staff: event.target.checked });
  }

  postNewUser() {
    axios.post(CUSTOMER_ENDPOINT, {
      username: this.state.name,
      email: this.state.email,
      is_staff: this.state.is_staff,
    })
      .then((result) => console.log(result));
  }

  render() {
    return (
      <form className="measure center">
        <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
          <legend className="f4 fw6 ph0 mh0">New Customer</legend>
          <div className="mv3">
            <label className="db fw6 lh-copy f6">UserName</label>
            <input className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="text" name="username" id="password" value={this.state.name} onChange={this.handleName} />
          </div>
          <div className="mt3">
            <label className="db fw6 lh-copy f6">Email</label>
            <input className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="email" value={this.state.email} onChange={this.handleEmail} id="email-address" />
          </div>
          <label className="pa0 ma0 lh-copy f6 pointer">
            <input type="checkbox" value={this.state.is_staff} onChange={this.handleCheck} />
            Is Staff?
          </label>
        </fieldset>
        <div className="">
          <input className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib" type="submit" value="Add New User" onClick={this.postNewUser} />
        </div>
      </form>
    );
  }
}

export default AddCustomerForm;
