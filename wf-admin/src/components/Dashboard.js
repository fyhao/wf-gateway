import React, { Component } from 'react';
import AppList from './AppList';
import InstanceList from './InstanceList';
import ExportPage from './ExportPage';
import MonitorPage from './MonitorPage';
import NavButton from './NavButton';
import NavBar from './NavBar';
import FlowEditor from './FlowEditor';
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
	  <Container fluid={true}>
		<Row>
			<Col>
			<h1>wf-admin <Badge color="secondary">New</Badge></h1>
			</Col>
		</Row>
        <Row>
          <Col sm="2">
		 <NavBar>
			<NavButton onClick={() => {ee.emit('navigatePage',{page:<AppList />})}} title="App"/>
			<NavButton onClick={() => {ee.emit('navigatePage',{page:<InstanceList />})}} title="Instance"/>
			<NavButton onClick={() => {ee.emit('navigatePage',{page:<ExportPage />})}} title="Export/Import"/>
			<NavButton onClick={() => {ee.emit('navigatePage',{page:<MonitorPage />})}} title="Monitor"/>
		</NavBar>
		</Col>
          <Col sm="10">
		  {this.state.currentPage}
		  </Col>
        </Row>
	  </Container>
	);
	}
	state = {
	  currentPage : <ExportPage />
	  //currentPage : <FlowEditor app="test" />
	}
}

export default Dashboard;
