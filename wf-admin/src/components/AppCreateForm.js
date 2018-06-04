import React, { Component } from 'react';
import EventEmitter from 'eventemitter3';
import axios from 'axios';
import Constants from './Constants';
import StandardForm from './StandardForm';
import AppList from './AppList';
import ee from './EventManager';
class AppCreateForm extends Component {
  constructor(opts) {
	  super(opts)
	  var me = this;
	  
	  this.state.options = {
		  title:'Create App',
		  fields:[
			{type:'text',label:'Name',id:'name',value:''},
			{type:'text',label:'Description',id:'description',value:''},
		  ],
		  onSubmit: function(opts) {
			  //opts.fields.name
			  console.log('onSubmit fields: ' + JSON.stringify(opts.fields));
			  axios({
				  method: 'post',
				  url: Constants.API_URL + '/app',
				  data: {
					name:opts.fields.name,
					description:opts.fields.description
				  }
				}).then(response => {
					console.log(response.data)
					if(response.data.status == '0') {
						ee.emit('navigatePage', {page:<AppList />});
					}
					else if(response.data.status == '100') {
						me.setErrorMessage('The name of app cannot be blank')
					}
					else if(response.data.status == '101') {
						me.setErrorMessage('The name of app is exist')
					}
					else {
						me.setErrorMessage('Undefined error:' + JSON.stringify(response.data));
					}
				})
		  }
	  };
	  this.setErrorMessage = this.setErrorMessage.bind(this)
  }
  
  state = {
	  
  }
  
  setErrorMessage(msg) {
	  var o = this.state.options;
	  this.state.options.errorMessage = msg;
	  this.setState({options:this.state.options})
  }
  
  
  render() {
    return (
      <div>
		<StandardForm options={this.state.options} />
	  </div>
	  
    );
  }
  
}

export default AppCreateForm;
