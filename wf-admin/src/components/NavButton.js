import React, { Component } from 'react';
import { NavLink,NavItem } from 'reactstrap';
class NavButton extends Component {
  render() {
    return (
		<NavItem>
      <NavLink onClick={this.props.onClick} href="#">{this.props.title}</NavLink>
	  </NavItem>
    );
  }
  
}

export default NavButton;
