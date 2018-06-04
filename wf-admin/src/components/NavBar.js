import React, { Component } from 'react';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem  } from 'reactstrap';
class NavBar extends Component {
  render() {
    return (
		<Nav vertical>
			{this.props.children}
		</Nav>
    );
  }
  
}

export default NavBar;
