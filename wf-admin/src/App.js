import React, { Component } from 'react';
import LoginGate from './components/LoginGate';
import './App.css';
import Dashboard from './components/Dashboard';

class App extends Component {
  render() {
    return (
      <LoginGate><Dashboard /></LoginGate>
    );
  }
}

export default App;
