import React, { Component } from 'react';
import { Container, Row, Col, Badge, Button,Form, FormGroup, Label, Input, FormText, Alert, Card, CardBody, CardText, CardTitle } from 'reactstrap';
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
	  else if(evt.action == 'sync') {
		  var flows = this.state.flows;
		  this.syncFlows(flows);
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
			if(typeof flows == 'undefined') {
				flows = {}
			}
			me.setState({flows:flows});
		})
  }
  syncFlows(flows) {
	  var me = this;
	  axios({
		  method: 'PUT',
		  url: Constants.API_URL + '/app/' + this.props.app + '/flow?isAll=1',
		  data: {
			  flows:flows
		  }
		}).then(response => {
			if(response.data.status == 0) {
				alert('Flows is saved')
			}
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
		<Container style={{borderColor:'red',border:1}}>
		<Row>
			<Col sm="3"><FlowCreatePanel /></Col>
			<Col sm="9"><Button onClick={() => {ee.emit('flowEditor',{action:'sync'})}}>Sync</Button></Col>
		</Row>
		<Row>
			<Col sm="3">
			 <FlowMenu flows={this.state.flows} />
			</Col>
			  <Col sm="9">
				<FlowStepsPanel />
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
	  this.handleSaveUpdate = this.handleSaveUpdate.bind(this);
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
		   
	   }
	   else if(evt.action == 'stepEditMoveUp') {
		   if(evt.index > 0) {
		       var step = this.state.flowObj.steps[evt.index];
			   this.state.flowObj.steps = this.swap(this.state.flowObj.steps, evt.index, evt.index-1);
			   this.setState({flowObj:this.state.flowObj});
		   }
	   }
	   else if(evt.action == 'stepEditMoveDown') {
		   if(evt.index < this.state.flowObj.steps.length - 1) {
			   var step = this.state.flowObj.steps[evt.index];
			   this.state.flowObj.steps = this.swap(this.state.flowObj.steps, evt.index, evt.index+1);
			   this.setState({flowObj:this.state.flowObj});
		   }
	   }
	}
	swap = function (arr, x,y) {
	  var b = arr[x];
	  arr[x] = arr[y];
	  arr[y] = b;
	  return arr;
	}
	state = {
		flowObj : {steps:[]}
	}
	handleSaveNew(step) {
		this.state.flowObj.steps.push(step);
		this.setState({flowObj:this.state.flowObj});
	}
	handleSaveUpdate(step, index) {
		this.state.flowObj.steps[index] = step;
		this.setState({flowObj:this.state.flowObj});
	}
	render() {
		var demoStep = {type:"request",action:"getParam",key:"key1",var:"var1"}
		return (<div>
		{this.state.flowName && <div>
		<p>Editing {this.state.flowName}</p>
		<Button onClick={() => {ee.emit('flowEditor', {action:'flowUpdated',flowName:this.state.flowName,flowObj:this.state.flowObj})}}>Save Flow</Button>
		
		{this.state.flowObj.steps.map((step,i) => (
			<StepEditPanel key={i} index={i} step={step} onSave={this.handleSaveUpdate}/>
		))}
		
		<StepCreatePanel onSave={this.handleSaveNew} />
		</div>}
			
		</div>)
	}
}
class StepEditPanel extends Component {
	constructor(opts) {
	  super(opts);
	  this.handleSave = this.handleSave.bind(this);
	  this.moveUp = this.moveUp.bind(this);
	  this.moveDown = this.moveDown.bind(this);
	  this.state.isExpand = false;
	 }
	 state = {}
	render() {
		var me = this;
		var stepsLabelArr = [];
		for(var i in this.props.step) {
			stepsLabelArr.push(i);
			stepsLabelArr.push(this.props.step[i]);
		}
		return (<div>
			<Container>
			<Row><Col sm="9">
			<Alert color="info" onClick={() => {this.setState({isExpand:!this.state.isExpand})}}>
			{stepsLabelArr.map((text,i) => (
				<span key={i}>
				{i%2==0 && <strong>{text}</strong>}
				<span> </span>
				{i%2==1 && <span>{text}</span>}
				<span> </span>
				<span> </span>
				</span>
			))}
			</Alert>
			</Col><Col sm="3"><Button color="info" onClick={this.moveUp}>Up</Button> <Button color="info" onClick={this.moveDown}>Down</Button></Col></Row>
			</Container>
			{this.state.isExpand && <StepWizard step={this.props.step} onSave={this.handleSave} />}
		</div>)
	}
	handleSave(step) {
		this.props.onSave(step,this.props.index)
	}
	moveUp() {
		ee.emit('flowEditor', {action:'stepEditMoveUp',index:this.props.index});
	}
	moveDown() {
		ee.emit('flowEditor', {action:'stepEditMoveDown',index:this.props.index});
	}
}
class StepCreatePanel extends Component {
	constructor(opts) {
	  super(opts);
	  this.handleSave = this.handleSave.bind(this);
	 }
	render() {
		return (<div>
			<StepWizard onSave={this.handleSave} heading="Create Step" />
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
	  this.state.heading = this.props.heading;
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
					this.state.step.action = '';
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
		return (<div style={{flex:12}}>
		
		<Card>
		
        <CardBody>
			{this.state.heading && <CardTitle>{this.state.heading}</CardTitle>}
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
				<SimpleTextInput id="body" value={this.state.step.body} onChange={this.handleChange}/>
				<SimpleSelectInput id="action" value={this.state.step.action} onChange={this.handleChange} options={['','setHeader','getHeader']} />
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
			
			<p>DEBUG {JSON.stringify(this.state.step)}</p>
		 </Form>
          
        </CardBody>
      </Card>
		</div>)
	}
} 

class SimpleTextInput extends Component {
	constructor(opts) {
		super(opts);
		if(this.props.value) {
			this.state.value = this.props.value;
		}
		else {
			this.state.value = '';
		}
		this.onChange = this.onChange.bind(this);
	}
	state={}
	onChange(evt) {
		this.state.value = evt.target.value;
		this.props.onChange(evt);
	}
	render() {
		return (<FormGroup>
					<Label for={this.props.id}>{this.props.id}</Label>
					<Input type="text" name={this.props.id} id={this.props.id} value={this.state.value} onChange={this.onChange}/>
				</FormGroup>)
	}
}

class SimpleSelectInput extends Component {
	constructor(opts) {
		super(opts);
		if(this.props.value) {
			this.state.value = this.props.value;
		}
		else {
			this.state.value = '';
		}
		
		this.onChange = this.onChange.bind(this);
	}
	state={}
	onChange(evt) {
		this.state.value = evt.target.value;
		this.props.onChange(evt);
	}
	render() {
		return (<FormGroup>
					<Label for={this.props.id}>{this.props.id}</Label>
					<Input type="select" name={this.props.id} id={this.props.id} value={this.state.value} onChange={this.onChange}>
						{this.props.options.map((o,i) => (
							<option key={i} value={o}>{o}</option>
						))}
					</Input>
				</FormGroup>)
	}
}

export default FlowEditor;
