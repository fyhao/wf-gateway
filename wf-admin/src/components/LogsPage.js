import React, { Component } from 'react';
import axios from 'axios';
import Constants from './Constants';
export default class LogsPage extends Component {
  state = { instances: [], instance: '', limit: 100, logs: [], error: '' };
  componentDidMount() {
    this.mounted = true;
    axios.get(Constants.API_URL + '/instance').then(response => {
      if (this.mounted) this.setState({instances:response.data.instances || []});
    }).catch(() => { if (this.mounted) this.setState({error:'Unable to load instances.'}); });
  }
  componentWillUnmount() { this.mounted = false; }
  load = event => {
    event.preventDefault();
    if (!this.state.instance) return;
    axios.get(Constants.API_URL + '/instance/' + encodeURIComponent(this.state.instance) + '/logs', {params:{limit:this.state.limit}}).then(response => {
      if (this.mounted) this.setState({logs:response.data.logs || [], error:''});
    }).catch(() => { if (this.mounted) this.setState({error:'Unable to retrieve instance logs.'}); });
  };
  render() {
    return <section><h2>Instance logs</h2><form onSubmit={this.load}>
      <label>Instance <select required value={this.state.instance} onChange={e => this.setState({instance:e.target.value})}>
        <option value="">Select an instance</option>{this.state.instances.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select></label>
      <label>Last lines <input type="number" min="1" max="1000" value={this.state.limit} onChange={e => this.setState({limit:e.target.value})} /></label>
      <button type="submit">Load logs</button></form>
      {this.state.error && <p role="alert">{this.state.error}</p>}
      <pre aria-live="polite">{this.state.logs.map(row => row.timestamp + ' [' + row.app + '/' + row.flow + '] ' + row.message).join('\n')}</pre>
    </section>;
  }
}
