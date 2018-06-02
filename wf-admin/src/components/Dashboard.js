import React, { Component } from 'react';
import AppList from './AppList';
import InstanceList from './InstanceList';
import NavButton from './NavButton';
import NavBar from './NavBar';
import ee from './EventManager';
class Dashboard extends Component {
	constructor(props) {
		super(props)
	}
	componentWillMount() {
	  ee.on('navigatePage', this.onNavigatePage, this);
	}
	componentWillUnmount() {
	  ee.off('navigatePage', this.onNavigatePage);
	}
	onNavigatePage(opts) {
	  var me = this;
	  me.setState({currentPage:opts.page})
	}
	render() {
	  
	return (
	  <div>DashBoard {this.text}
		<NavBar>
			<NavButton onClick={() => {ee.emit('navigatePage',{page:<AppList />})}} title="App"/>
			<NavButton onClick={() => {ee.emit('navigatePage',{page:<InstanceList />})}} title="Instance"/>
		</NavBar>
		{this.state.currentPage}
	  </div>
	);
	}
	state = {
	  currentPage : <AppList />
	}
}

export default Dashboard;
