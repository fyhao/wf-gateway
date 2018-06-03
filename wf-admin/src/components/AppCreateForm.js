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
			{type:'text',label:'Description',id:'description',value:''}
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
				})
		  }
	  };
  }
  
  state = {
	  
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
