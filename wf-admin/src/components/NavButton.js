import React, { Component } from 'react';

class NavButton extends Component {
  render() {
    return (
      <button onClick={this.props.onClick}>{this.props.title}</button>
    );
  }
  
}

export default NavButton;
