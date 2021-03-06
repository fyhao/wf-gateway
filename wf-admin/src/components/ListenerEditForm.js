import React, { Component } from 'react';
import { Button } from 'reactstrap';
import EventEmitter from 'eventemitter3';
import axios from 'axios';
import Constants from './Constants';
import StandardForm from './StandardForm';
import AppEditForm from './AppEditForm';
import AppList from './AppList';
import ListenerList from './ListenerList';
import ee from './EventManager';
class ListenerCreateForm extends Component {
  constructor(opts) {
	  super(opts)
	  var me = this;
	  this.app = this.props.app;
	  this.listener_id = this.props.listener_id;
	  this.state.options = {
		  title:'Update Listener',
		  fields:[
			{type:'selectone',label:'Type',id:'type',options:[{key:'http',value:'http'},{key:'smtp',value:'smtp'}],value:'http'},
			{type:'selectone',label:'Method',id:'method',options:[{key:'GET',value:'GET'},{key:'POST',value:'POST'},{key:'PUT',value:'PUT'},{key:'DELETE',value:'DELETE'}],value:'GET'},
			{type:'text',label:'Endpoint',id:'endpoint',value:''},
		  ],
		  onSubmit: function(opts) {
			  //opts.fields.name
			  console.log('onSubmit fields: ' + JSON.stringify(opts.fields));
			  axios({
				  method: 'PUT',
				  url: Constants.API_URL + '/app/' + me.app + '/listener/' + me.listener_id,
				  data: {
					listener:{
						type:opts.fields.type,
						endpoint:opts.fields.endpoint,
						method:opts.fields.method,
						flow:opts.fields.flow
					}
				  }
				}).then(response => {
					console.log(response.data)
					if(response.data.status == '0') {
						ee.emit('navigatePage', {page:<ListenerList app={me.app} />});
					}
				})
		  }
	  };
	  this.requestFlows(function() {
		  axios({
			  method:'GET',
			  url: Constants.API_URL + '/app/' + me.app + '/listener/' + me.listener_id
		  }).then(response => {
			  console.log(response.data)
			  var item = response.data.listener;
			  me.state.options.fields.map((field,i) => {
				  field.value = item[field.id];
			  });
			  me.setState({options:me.state.options})
		  });
	  });
	  
		
	 this.handleDelete = this.handleDelete.bind(this)
  }
  requestFlows(done) {
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
			var selectOptions = [];
			for(var flowName in flows) {
				selectOptions.push({key:flowName,value:flowName});
			}
			me.state.options.fields.push({type:'selectone',label:'Flow',id:'flow',options:selectOptions});
			me.setState({flows:flows});
			
			done();
		})
  }
  state = {
	  options:{}
  }
  handleDelete() {
	  var me = this;
	  axios({
		  method: 'DELETE',
		  url: Constants.API_URL + '/app/' + this.app + '/listener/' + this.listener_id,
		  data: {
			
		  }
		}).then(response => {
			if(response.data.status == '0') {
				ee.emit('navigatePage', {page:<ListenerList app={me.app} />});
			}
		})
  }
  
  
  render() {
    return (
      <div>
	    <Button color="primary" onClick={this.handleDelete}>Delete Listener</Button>
		<Button color="primary" onClick={() => {ee.emit('navigatePage', {page:<ListenerList app={this.app} />});}}>Manage Listeners</Button>
		<StandardForm options={this.state.options} />
	  </div>
	  
    );
  }
  
}

export default ListenerCreateForm;
