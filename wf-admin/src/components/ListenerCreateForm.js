import React, { Component } from 'react';
import EventEmitter from 'eventemitter3';
import axios from 'axios';
import Constants from './Constants';
import StandardForm from './StandardForm';
import AppEditForm from './AppEditForm';
import AppList from './AppList';
import ee from './EventManager';
class ListenerCreateForm extends Component {
  constructor(opts) {
	  super(opts)
	  var me = this;
	  var app = this.props.app;
	  this.state.options = {
		  title:'Create Listener',
		  fields:[
			{type:'selectone',label:'Type',id:'type',options:[{key:'http',value:'http'},{key:'smtp',value:'smtp'}],value:'http'},
			{type:'selectone',label:'Method',id:'method',options:[{key:'GET',value:'GET'},{key:'POST',value:'POST'},{key:'PUT',value:'PUT'},{key:'DELETE',value:'DELETE'}],value:'GET'},
			{type:'text',label:'Endpoint',id:'endpoint',value:''},
		  ],
		  onSubmit: function(opts) {
			  //opts.fields.name
			  console.log('onSubmit fields: ' + JSON.stringify(opts.fields));
			  axios({
				  method: 'post',
				  url: Constants.API_URL + '/app/' + app + '/listener',
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
						ee.emit('navigatePage', {page:<AppEditForm app={app} />});
					}
				})
		  }
	  };
	  this.requestFlows();
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
			var selectOptions = [];
			for(var flowName in flows) {
				selectOptions.push({key:flowName,value:flowName});
			}
			me.state.options.fields.push({type:'selectone',label:'Flow',id:'flow',options:selectOptions});
			me.setState({flows:flows});
		})
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

export default ListenerCreateForm;
