import React, { Component } from 'react';
import { Container, Row, Col, Badge, Button,Form, FormGroup, Label, Input, FormText, Alert } from 'reactstrap';
import ListView from './ListView';
import ee from './EventManager';
import Constants from './Constants';
import axios from 'axios';
import AppEditForm from './AppEditForm';
import NavButton from './NavButton';
import NavBar from './NavBar';
class FlowEditor extends Component {
  constructor(opts) {
	  super(opts)
	  this.onFlowEditor = this.onFlowEditor.bind(this);
  }
  componentWillMount() {
	  this.requestFlows()
	  ee.on('flowEditor', this.onFlowEditor)
  }
  componentWillUnmount() {
	  ee.off('flowEditor', this.onFlowEditor)
  }
  onFlowEditor(evt) {
	  if(evt.action == 'requestAddFlow') {
		  var flowName = evt.flowName;
		  if(typeof this.state.flows[flowName] != 'undefined') {
			  ee.emit('flowEditor', {action:'requestAddFlow.resp',status:1});
		  }
		  else {
			  ee.emit('flowEditor', {action:'requestAddFlow.resp',status:0});
		  }
	  }
	  else if(evt.action == 'flowAdded') {
		  var flowName = evt.flowName;
		  this.setFlow(flowName, {steps:[]});
	  }
  }
  
  componentDidMount() {
	 	
  }
  
  requestFlows() {
	  var me = this;
	  axios({
		  method: 'GET',
		  url: Constants.API_URL + '/app/' + this.props.app + '/flow',
		  data: {
		  }
		}).then(response => {
			var flows = response.data.flows;
			
			me.setState({flows:flows});
		})
  }
  setFlow(flowName, flowObj) {
	  var flows = this.state.flows;
	  flows[flowName] = flowObj;
	  this.setState({flows:flows})
  }
  state = {
	 flows:{}
  }
  
  
  render() {
    return (
      <div>
	    <Button color="primary" onClick={() => {ee.emit('navigatePage',{page:<AppEditForm app={this.props.app} />})}}>Back To Edit App</Button>
		<h3>Flows</h3>
		<Container>
		<Row>
			<FlowCreatePanel />
		</Row>
		<Row>
			<Col xs="3">
			 <FlowMenu flows={this.state.flows} />
			</Col>
			  <Col xs="6">
			  
			  </Col>
		</Row>
		</Container>
	  </div>
	  
    );
  }
  
}


class FlowMenu extends Component {
	constructor(opts) {
	  super(opts)
	  this.onFlowEditor = this.onFlowEditor.bind(this);
  }
	componentWillMount() {
	  ee.on('flowEditor', this.onFlowEditor)
	}
	componentWillUnmount() {
	  ee.off('flowEditor', this.onFlowEditor)
	}
	onFlowEditor(evt) {
	  
	}
	render() {
		var flowNames = [];
		for(var k in this.props.flows) {
			flowNames.push(k);
		}
		return (
			<div>
			<NavBar>
				{flowNames.map((flowName,i) => (
					<NavButton title={flowName}/>
				))}
				
			</NavBar>
			</div>
		)
	}
}

class FlowCreatePanel extends Component {
	constructor(opts) {
		super(opts)
		this.state.isToAdd = false;
		this.state.flowName = '';
		this.state.errorMessage = '';
		this.onFlowEditor = this.onFlowEditor.bind(this);
		this.handleAddNewFlow = this.handleAddNewFlow.bind(this);
	}
	componentWillMount() {
	  ee.on('flowEditor', this.onFlowEditor)
	}
	componentWillUnmount() {
	  ee.off('flowEditor', this.onFlowEditor)
	}
	onFlowEditor(evt) {
	   if(evt.action == 'requestAddFlow.resp') {
		   var status = evt.status;
		   if(status == 0) {
			   ee.emit('flowEditor', {action:'flowAdded', flowName:this.state.flowName});
		   }
		   else {
			   this.setErrorMessage("Flow is Exist, Cannot Add")
		   }
	   } // end of requestAddFlow.resp
	}
	handleAddNewFlow() {
		var flowName = this.state.flowName;
		if(flowName.length == 0) {
			this.setErrorMessage("Flow Name cannot be blank");
			return;
		}
		ee.emit('flowEditor', {action:'requestAddFlow',flowName:flowName});
	}
	setErrorMessage(msg) {
		this.setState({errorMessage:msg})
	}
	state = {
		
	}
	render() {
		return (<div>
			{!this.state.isToAdd && <Button color="primary" onClick={() => {this.setState({isToAdd:true})}}>Add</Button>}
			{this.state.isToAdd && <Form>
				<FormGroup>
					<Label for="flowName">Flow Name</Label>
					<Input type="text" name="flowName" id="flowName" placeholder="Name of flow" onChange={(evt) => {this.setState({flowName:evt.target.value})}} />
				</FormGroup>
				<FormGroup>
					<Button color="success" onClick={this.handleAddNewFlow}>Add New Flow</Button>
				</FormGroup>
				<FormGroup>
				{this.state.errorMessage && <Alert color="danger">
					{this.state.errorMessage}
				</Alert>}
				</FormGroup>
			</Form>}
		</div>)
	}
}

export default FlowEditor;
