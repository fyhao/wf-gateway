import React, { Component } from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import ListView from './ListView';
import ee from './EventManager';
import Constants from './Constants';
import axios from 'axios';
import ListenerCreateForm from './ListenerCreateForm';
import AppEditForm from './AppEditForm';
import ListenerEditForm from './ListenerEditForm';
class AppInstanceList extends Component {
	constructor(opts) {
	  super(opts)
	  this.onAppInstanceEditor = this.onAppInstanceEditor.bind(this);
    }
	componentWillMount() {
	  ee.on('appInstanceEditor', this.onAppInstanceEditor)
	  this.requestInstances();
	}
	componentWillUnmount() {
	  ee.off('appInstanceEditor', this.onAppInstanceEditor)
	}
	onAppInstanceEditor(evt) {
	  if(evt.action == 'instanceAssigned') {
		  this.requestInstances();
	  }
	  else if(evt.action == 'instanceRemoved') {
		  this.requestInstances();
	  }
	}
  
  requestInstances() {
	  var me = this;
	  axios({
		  method: 'GET',
		  url: Constants.API_URL + '/app/' + this.props.app + '/instance',
		  data: {
		  }
		}).then(response => {
			me.setState({data:response.data.instances});
		})
  }
  state = {
	 data:[]
  }
  
  
  render() {
	var me = this;
	var options = {};
	options.data = this.state.data;
	options.fields = [
		{heading:'Name',key:'name'},
		{heading:'Description',key:'description'},
		{heading:'Host',key:'host'},
	];
	options.hasDelete = true;
	options.handleDelete = function(row) {
		axios.delete(Constants.API_URL + '/app/' + me.props.app + "/instance/" + row.id)
	    .then(response => {
			if(response.data.status == 0) {
				ee.emit('appInstanceEditor', {action:'instanceRemoved'});
			}
			else {
				alert("Undefined error status: " + response.data.status);
			}
		})
	}
    return (
      <div>
		<h3>Manage Instances for apps</h3>
		<ListView options={options}/>
		<AssignInstancePanel app={this.props.app} />
	  </div>
	  
    );
  }
  
}
class AssignInstancePanel extends Component {
	constructor(opts) {
	  super(opts)
	  var me = this;
	  this.onAppInstanceEditor = this.onAppInstanceEditor.bind(this);
	  this.handleAssign = this.handleAssign.bind(this);
    }
	componentWillMount() {
		var me = this;
	  ee.on('appInstanceEditor', this.onAppInstanceEditor)
	  
	  axios.get(Constants.API_URL + '/instance')
	    .then(response => {
			this.state.selected_instance_id = -1;
			if(response.data.instances.length) {
				this.state.selected_instance_id = response.data.instances[0].id;
			}
			me.setState({instances:response.data.instances,selected_instance_id:this.state.selected_instance_id})
		})
	}
	componentWillUnmount() {
	  ee.off('appInstanceEditor', this.onAppInstanceEditor)
	}
	onAppInstanceEditor(evt) {
	}
	state = {
		instances : [],
		selected_instance_id : -1
	}
	handleAssign() {
		axios.post(Constants.API_URL + '/app/' + this.props.app + "/instance/" + this.state.selected_instance_id)
	    .then(response => {
			console.log('handleAssign response:' + response.data.status);
			if(response.data.status == 0) {
				ee.emit('appInstanceEditor', {action:'instanceAssigned'});
			}
			else {
				alert("Undefined error status: " + response.data.status);
			}
		})
	}
	render() {
		return (<div>
			<Form>
				<FormGroup>
					<Label for="instance_id">Instance</Label>
					<Input type="select" name="instance_id" id="instance_id" placeholder="Instance" onChange={(evt) => {this.setState({selected_instance_id:evt.target.value})}}>
						{this.state.instances.map((instance,i) => (
							<option key={i} value={instance.id}>{instance.name}</option>
						))}
						
					</Input>
				</FormGroup>
				<Button color="success" onClick={this.handleAssign}>Assign</Button>
			</Form>
		</div>)
	}
}
export default AppInstanceList;
