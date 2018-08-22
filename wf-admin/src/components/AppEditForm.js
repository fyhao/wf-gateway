import React, { Component } from 'react';
import EventEmitter from 'eventemitter3';
import axios from 'axios';
import Constants from './Constants';
import StandardForm from './StandardForm';
import NavButton from './NavButton';
import AppList from './AppList';
import ListenerList from './ListenerList';
import AppInstanceList from './AppInstanceList';
import FlowEditor from './FlowEditor';
import ListView from './ListView';
import ee from './EventManager';
import { Button } from 'reactstrap';
class AppEditForm extends Component {
  constructor(opts) {
	  super(opts)
	  var me = this;
	  
	  this.app = me.props.app;
	  
	  me.state.options = {
		  title:'Update App',
		  fields:[
			{type:'text',label:'Name',id:'name',value:''},
			{type:'text',label:'Description',id:'description',value:''}
		  ],
		  onSubmit: function(opts) {
			  console.log('AppEditForm onSubmit:' + JSON.stringify(opts));
			  //opts.fields.name
			  axios({
				  method: 'PUT',
				  url: Constants.API_URL + '/app/' + opts.fields.name,
				  data: {
					fields : {
						name:opts.fields.name,
						description:opts.fields.description
					}
				  }
				}).then(response => {
					console.log(response.data)
					if(response.data.status == '0') {
						ee.emit('navigatePage', {page:<AppList />});
					}
				})
				
		  } // end onSubmit
	  }; 
		  
	  axios({
		  method:'GET',
		  url: Constants.API_URL + '/app/' + this.app
	  }).then(response => {
		  console.log(response.data)
		  var item = response.data;
		  me.state.options.fields.map((field,i) => {
			  field.value = item[field.id];
		  });
		  me.setState({options:me.state.options})
	  });
		
		
	  this.componentWillMount = this.componentWillMount.bind(this);
	  this.componentWillUnmount = this.componentWillUnmount.bind(this);
	  this.handleDelete = this.handleDelete.bind(this);
	  this.handleDuplicate = this.handleDuplicate.bind(this);
  }
  
  state = {
	  options:{}
  }
  
  componentWillMount(){
  }
  componentWillUnmount() {
  }
  handleDelete() {
	  axios({
		  method: 'DELETE',
		  url: Constants.API_URL + '/app/' + this.app,
		  data: {
			
		  }
		}).then(response => {
			if(response.data.status == '0') {
				ee.emit('navigatePage', {page:<AppList />});
			}
		})
  }
  handleDuplicate() {
	  var newName
	  axios({
		  method: 'POST',
		  url: Constants.API_URL + '/app/' + this.app + '/duplicate',
		  data: {
			newName:prompt('Please enter new app name')
		  }
		}).then(response => {
			alert('Duplicated status: ' + response.data.status);
		})
  }
 
  render() {
    return (
      <div>
		<Button color="primary" onClick={this.handleDelete}>Delete Apps</Button>
		<Button color="primary" onClick={() => {ee.emit('navigatePage', {page:<ListenerList app={this.app} />});}}>Manage Listeners</Button>
		<Button color="primary" onClick={() => {ee.emit('navigatePage', {page:<AppInstanceList app={this.app} />});}}>Manage Instances</Button>
		<Button color="primary" onClick={() => {ee.emit('navigatePage', {page:<FlowEditor app={this.app} />});}}>Flow Editor</Button>
		<Button color="primary" onClick={this.handleDuplicate}>Duplicate Apps</Button>
		<StandardForm options={this.state.options} />
	  </div>
    );
  }
  
}

export default AppEditForm;
