import React, { Component } from 'react';
import AppList from './AppList';
import InstanceList from './InstanceList';
import NavButton from './NavButton';
import NavBar from './NavBar';
import ee from './EventManager';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Badge } from 'reactstrap';


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
	  <Container>
		<Row>
			<Col>
			<h1>wf-admin <Badge color="secondary">New</Badge></h1>
			</Col>
		</Row>
        <Row>
          <Col xs="3">
		 <NavBar>
			<NavButton onClick={() => {ee.emit('navigatePage',{page:<AppList />})}} title="App"/>
			<NavButton onClick={() => {ee.emit('navigatePage',{page:<InstanceList />})}} title="Instance"/>
		</NavBar>
		</Col>
          <Col xs="6">
		  {this.state.currentPage}
		  </Col>
        </Row>
	  </Container>
	);
	}
	state = {
	  currentPage : <AppList />
	}
}

export default Dashboard;
