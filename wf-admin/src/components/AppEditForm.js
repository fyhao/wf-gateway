import React, { Component } from 'react';
import EventEmitter from 'eventemitter3';
import axios from 'axios';
import Constants from './Constants';
import StandardForm from './StandardForm';
import NavButton from './NavButton';
import AppList from './AppList';
import ee from './EventManager';
class AppEditForm extends Component {
  constructor(opts) {
	  super(opts)
	  var me = this;
	  this.state.options = {
		  title:'Update App',
		  fields:[
			{type:'text',label:'Name',id:'name',value:''},
			{type:'text',label:'Description',id:'description',value:''}
		  ],
		  onSubmit: function(opts) {
			  //opts.fields.name
			  console.log('onsubmit for appeditofmr fields: ' + JSON.stringify(opts.fields));
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
	  
	  this.componentWillMount = this.componentWillMount.bind(this);
	  this.componentWillUnmount = this.componentWillUnmount.bind(this);
	  this.onEditForm = this.onEditForm.bind(this);
	  this.handleDelete = this.handleDelete.bind(this);
  }
  
  state = {
	  
  }
  
  componentWillMount(){
	  ee.on('editForm', this.onEditForm)
	  ee.emit('editFormShown')
  }
  componentWillUnmount() {
	  ee.off('editForm', this.onEditForm)
  }
  onEditForm(opts) {
	  var options = this.state.options;
	  options.fields.map((field,i) => {
		  field.value = opts.row[field.id]
	  })
	  this.setState({options:options});
	  this.row = opts.row;
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
  
  render() {
	
    return (
      <div>
		<NavButton onClick={this.handleDelete} title="Delete"/>
		<StandardForm options={this.state.options} />
		<p>DEBUG: {this.state.submittedFields}</p>
	  </div>
	  
    );
  }
  
}

export default AppEditForm;
