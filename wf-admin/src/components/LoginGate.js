import React, { Component } from 'react';
import axios from 'axios';
import Constants from './Constants';
import ee from './EventManager';

export default class LoginGate extends Component {
  state = { loading: true, authenticated: false, enabled: true, error: '', username: '', password: '', secondFactor: '' };
  componentDidMount() {
    this.mounted = true;
    this.expired = () => { if (this.mounted) this.setState({ authenticated: false, error: 'Session expired. Please sign in.' }); };
    ee.on('sessionExpired', this.expired);
    axios.get(Constants.API_URL + '/auth/status').then(response => {
      if (this.mounted) this.setState({ loading: false, enabled: response.data.enabled });
    }).catch(() => { if (this.mounted) this.setState({loading:false, error:'Unable to connect to the control API.'}); });
  }
  componentWillUnmount() { this.mounted = false; ee.off('sessionExpired', this.expired); }
  login = event => {
    event.preventDefault();
    axios.post(Constants.API_URL + '/auth/login', {username:this.state.username, password:this.state.password, secondFactor:this.state.secondFactor}).then(response => {
      Constants.setToken(response.data.accessToken);
      if (this.mounted) this.setState({authenticated:true, password:'', secondFactor:'', error:''});
    }).catch(() => { if (this.mounted) this.setState({error:'Sign-in failed. Check your credentials and second factor.'}); });
  };
  logout = () => {
    axios.post(Constants.API_URL + '/auth/logout').catch(() => {}).then(() => {
      Constants.setToken(null);
      if (this.mounted) this.setState({authenticated:false});
    });
  };
  render() {
    if (this.state.loading) return <p>Connecting to control API…</p>;
    if (!this.state.enabled || this.state.authenticated) return <div>{this.state.enabled && <button onClick={this.logout}>Sign out</button>}{this.props.children}</div>;
    return <form className="login-form" onSubmit={this.login}>
      <h1>WF Gateway sign in</h1>
      {this.state.error && <p role="alert">{this.state.error}</p>}
      <label>Username<input autoComplete="username" value={this.state.username} onChange={e => this.setState({username:e.target.value})} required /></label>
      <label>Password<input type="password" autoComplete="current-password" value={this.state.password} onChange={e => this.setState({password:e.target.value})} required /></label>
      <label>Second factor (if required)<input autoComplete="one-time-code" value={this.state.secondFactor} onChange={e => this.setState({secondFactor:e.target.value})} /></label>
      <button type="submit">Sign in</button>
    </form>;
  }
}
