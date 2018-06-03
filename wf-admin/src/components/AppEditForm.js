import React, { Component } from 'react';
import EventEmitter from 'eventemitter3';
import axios from 'axios';
import Constants from './Constants';
import StandardForm from './StandardForm';
import NavButton from './NavButton';
import AppList from './AppList';
import ListenerCreateForm from './ListenerCreateForm';
import ListView from './ListView';
import ee from './EventManager';
import { Button } from 'reactstrap';
class AppEditForm extends Component {
  constructor(opts) {
	  super(opts)
	  var me = this;
	  
	  
	  this.row = me.props.row;
		me.state.options = {
		  title:'Update App',
		  fields:[
			{type:'text',label:'Name',id:'name',value:me.row.name},
			{type:'text',label:'Description',id:'description',value:me.row.description}
		  ],
		  onSubmit: function(opts) {
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
		  }
		};
		me.requestListener()



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
		  url: Constants.API_URL + '/app/' + this.row.name,
		  data: {
			
		  }
		}).then(response => {
			if(response.data.status == '0') {
				ee.emit('navigatePage', {page:<AppList />});
			}
		})
  }
  
  requestListener() {
	  var me = this;
	  axios({
		  method: 'GET',
		  url: Constants.API_URL + '/app/' + this.row.name + '/listener',
		  data: {
		  }
		}).then(response => {
			me.setState({listenerData:response.data.listeners});
		})
  }
  state = {
	 listenerData:[]
  }
  render() {
	var options = {};
	
	options.data = this.state.listenerData;
	options.fields = [
		{heading:'Type',key:'type'},
		{heading:'Endpoint',key:'endpoint'}
	];
	
    return (
      <div>
		<Button color="primary" onClick={this.handleDelete}>Delete Apps</Button>
		<StandardForm options={this.state.options} />
		<h3>Listeners</h3>
		<Button color="primary" onClick={() => {ee.emit('navigatePage',{page:<ListenerCreateForm app={this.row} />})}}>Create Listener</Button>
		<ListView options={options}/>
	  </div>
	  
    );
  }
  
}

export default AppEditForm;
