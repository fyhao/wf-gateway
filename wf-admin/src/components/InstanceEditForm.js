import React, { Component } from 'react';
import EventEmitter from 'eventemitter3';
import axios from 'axios';
import Constants from './Constants';
import StandardForm from './StandardForm';
import NavButton from './NavButton';
import InstanceList from './InstanceList';
import FlowEditor from './FlowEditor';
import ListView from './ListView';
import ee from './EventManager';
import { Button } from 'reactstrap';
class InstanceEditForm extends Component {
  constructor(opts) {
	  super(opts)
	  var me = this;
	  this.instance_id = me.props.id;
	  me.state.options = {
		  title:'Update Instance',
		  fields:[
			{type:'text',label:'Name',id:'name',value:''},
			{type:'text',label:'Description',id:'description',value:''},
			{type:'text',label:'Host',id:'host',value:''},
		  ],
		  onSubmit: function(opts) {
			  console.log('InstanceEditForm onSubmit:' + JSON.stringify(opts));
			  //opts.fields.name
			  axios({
				  method: 'PUT',
				  url: Constants.API_URL + '/instance/' + me.instance_id,
				  data: {
					name:opts.fields.name,
					description:opts.fields.description,
					host:opts.fields.host
				  }
				}).then(response => {
					console.log(response.data)
					if(response.data.status == '0') {
						ee.emit('navigatePage', {page:<InstanceList />});
					}
				})
				
		  } // end onSubmit
	  }; 
		  
	  axios({
		  method:'GET',
		  url: Constants.API_URL + '/instance/' + this.instance_id
	  }).then(response => {
		  var item = response.data.instance;
		  me.state.options.fields.map((field,i) => {
			  field.value = item[field.id];
		  });
		  me.setState({options:me.state.options})
	  });
		
		
	  this.componentWillMount = this.componentWillMount.bind(this);
	  this.componentWillUnmount = this.componentWillUnmount.bind(this);
	  this.handleDelete = this.handleDelete.bind(this);
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
		  url: Constants.API_URL + '/instance/' + this.instance_id,
		  data: {
			
		  }
		}).then(response => {
			if(response.data.status == '0') {
				ee.emit('navigatePage', {page:<InstanceList />});
			}
		})
  }
  
 
  render() {
    return (
      <div>
		<Button color="primary" onClick={this.handleDelete}>Delete Instance</Button>
		<StandardForm options={this.state.options} />
	  </div>
    );
  }
  
}

export default InstanceEditForm;
