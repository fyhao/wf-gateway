import React, { Component } from 'react';

class NavBar extends Component {
  render() {
    return (
      <div className="navbar">
		before{this.props.children}after
	  </div>
    );
  }
  
}

export default NavBar;
