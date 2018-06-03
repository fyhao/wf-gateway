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
		  ee.emit('flowEditor',{action:'flowSelectedToEdit', flowName:flowName})
	  }
	  else if(evt.action == 'flowUpdated') {
		  var flowName = evt.flowName;
		  var flowObj = evt.flowObj;
		  this.setFlow(flowName, flowObj);
	  }
	  else if(evt.action == 'flowSelectedToEdit') {
		  var flowName = evt.flowName;
		  var flowObj = this.state.flows[flowName];
		  ee.emit('flowEditor', {action:'flowSelected', flowName:flowName,flowObj:flowObj})
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
				<FlowStepsPanel />
			  </Col>
		</Row>
		</Container>
		DEBUG:{JSON.stringify(this.state.flows)}
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
					<NavButton key={i} title={flowName} onClick={() => {ee.emit('flowEditor',{action:'flowSelectedToEdit', flowName:flowName})}}/>
				))}
				
			</NavBar>
			</div>
		)
	}
}

class FlowCreatePanel extends Component {
	constructor(opts) {
		super(opts)
		this.reset();
		this.onFlowEditor = this.onFlowEditor.bind(this);
		this.handleAddNewFlow = this.handleAddNewFlow.bind(this);
	}
	reset() {
		this.state.isToAdd = false;
		this.state.flowName = '';
		this.state.errorMessage = '';
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
			   this.reset();
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

class FlowStepsPanel extends Component {
	constructor(opts) {
	  super(opts)
	  this.onFlowEditor = this.onFlowEditor.bind(this);
	  this.handleSaveNew = this.handleSaveNew.bind(this);
    }
	componentWillMount() {
	  ee.on('flowEditor', this.onFlowEditor)
	}
	componentWillUnmount() {
	  ee.off('flowEditor', this.onFlowEditor)
	}
	onFlowEditor(evt) {
	   if(evt.action == 'flowSelected') {// flowSelected
		   var flowName = evt.flowName;
		   var flowObj = evt.flowObj;
		   this.setState({flowName:flowName,flowObj:flowObj})
		   
		   // Sample code for flowUpdated notification
		   //flowObj.steps.push('1')
		   //ee.emit('flowEditor', {action:'flowUpdated',flowName:flowName,flowObj:flowObj});
	   }
	}
	state = {
		flowObj : {steps:[]}
	}
	handleSaveNew(step) {
		this.state.flowObj.steps.push(step);
		this.setState({flowObj:this.state.flowObj});
	}
	render() {
		var demoStep = {type:"request",action:"getParam",key:"key1",var:"var1"}
		return (<div>
		{this.state.flowName && <div>
		<p>Editing {this.state.flowName}</p>
		<p>DEBUG: {JSON.stringify(this.state.flowObj)}</p>
		
		{this.state.flowObj.steps.map((step,i) => (
			<StepWizard key={i} step={step} />
		))}
		
		<StepCreatePanel onSave={this.handleSaveNew} />
		</div>}
			
		</div>)
	}
}
class StepCreatePanel extends Component {
	constructor(opts) {
	  super(opts);
	  this.handleSave = this.handleSave.bind(this);
	 }
	render() {
		return (<div>
			<h6>Create Steps</h6>
			<StepWizard onSave={this.handleSave} />
		</div>)
	}
	handleSave(step) {
		this.props.onSave(step)
	}
}
class StepWizard extends Component {
	constructor(opts) {
	  super(opts)
	  this.onFlowEditor = this.onFlowEditor.bind(this);
	  this.handleChange = this.handleChange.bind(this);
	  this.handleSave = this.handleSave.bind(this);
	  this.state.step = this.props.step;
	  if(typeof this.state.step == 'undefined') {
		  this.state.step = {type:'setVar'}; 
	  }
    }
	componentWillMount() {
	  ee.on('flowEditor', this.onFlowEditor)
	}
	componentWillUnmount() {
	  ee.off('flowEditor', this.onFlowEditor)
	}
	onFlowEditor(evt) {
	   
	}
	state = {
		
	}
	handleSave() {
		this.props.onSave(this.state.step)
	}
	handleChange(evt) {
		var name = evt.target.name;
		var value = evt.target.value;
		if(name == 'type') {
			var oldValue = this.state.step[name];
			if(value != oldValue) { // reinitialize a new step with single attribute type
				this.state.step = {type:value}; 
				if(value == 'request') { // set default value here
					this.state.step.action = 'getParam';
				}
				else if(value == 'response') {
					this.state.step.action = 'setHeader';
				}
				this.setState({step:this.state.step});
			}
		}
		else {
			this.state.step[name] = value;
			this.setState({step:this.state.step});
		}
	}
	render() {
		return (<div>
		 <Form>
			<FormGroup>
				<Label for="type">type</Label>
				<Input type="select" name="type" id="type" placeholder="type of flow" value={this.state.step.type} onChange={this.handleChange}>
					<option value="setVar">setVar</option>
					<option value="request">request</option>
					<option value="response">response</option>
					<option value="log">log</option>
					<option value="http">http</option>
				</Input>
			</FormGroup>
			
			{this.state.step.type == 'setVar' && <span>
				<SimpleTextInput id="name" value={this.state.step.name} onChange={this.handleChange}/>
				<SimpleTextInput id="value" value={this.state.step.value} onChange={this.handleChange}/>
			</span>}
			
			{this.state.step.type == 'request' && <span>
				<SimpleSelectInput id="action" value={this.state.step.action} onChange={this.handleChange} options={['getParam','getPathParam','getBody','getHeader']} />
				<SimpleTextInput id="key" value={this.state.step.key} onChange={this.handleChange}/>
				<SimpleTextInput id="var" value={this.state.step.var} onChange={this.handleChange}/>
			</span>}
			
			{this.state.step.type == 'response' && <span>
				<SimpleSelectInput id="action" value={this.state.step.action} onChange={this.handleChange} options={['setHeader','getHeader']} />
				<SimpleTextInput id="key" value={this.state.step.key} onChange={this.handleChange}/>
				<SimpleTextInput id="var" value={this.state.step.var} onChange={this.handleChange}/>
				<SimpleTextInput id="value" value={this.state.step.value} onChange={this.handleChange}/>
			</span>}
			
			{this.state.step.type == 'log' && <span>
				<SimpleTextInput id="log" value={this.state.step.log} onChange={this.handleChange}/>
			</span>}
			
			{this.state.step.type == 'http' && <span>
				<SimpleTextInput id="method" value={this.state.step.method} onChange={this.handleChange}/>
				<SimpleTextInput id="url" value={this.state.step.url} onChange={this.handleChange}/>
				<SimpleTextInput id="params" value={this.state.step.params} onChange={this.handleChange}/>
				<SimpleTextInput id="headers" value={this.state.step.headers} onChange={this.handleChange}/>
				<SimpleTextInput id="varJson" value={this.state.step.varJson} onChange={this.handleChange}/>
				<SimpleTextInput id="var" value={this.state.step.var} onChange={this.handleChange}/>
			</span>}
			
			<Button color="success" onClick={this.handleSave}>Save</Button>
		 </Form>
		 <p>DEBUG_STEPWIZARD: {JSON.stringify(this.state.step)}</p>
		</div>)
	}
} 

class SimpleTextInput extends Component {
	constructor(opts) {
		super(opts);
		this.state.value = this.props.value;
	}
	state={}
	render() {
		return (<FormGroup>
					<Label for={this.props.id}>{this.props.id}</Label>
					<Input type="text" name={this.props.id} id={this.props.id} value={this.state.value} onChange={this.props.onChange}/>
				</FormGroup>)
	}
}

class SimpleSelectInput extends Component {
	constructor(opts) {
		super(opts);
		this.state.value = this.props.value;
	}
	state={}
	render() {
		return (<FormGroup>
					<Label for={this.props.id}>{this.props.id}</Label>
					<Input type="select" name={this.props.id} id={this.props.id} value={this.state.value} onChange={this.props.onChange}>
						{this.props.options.map((o,i) => (
							<option key={i} value={o}>{o}</option>
						))}
					</Input>
				</FormGroup>)
	}
}

export default FlowEditor;
