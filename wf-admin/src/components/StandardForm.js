import React, { Component } from 'react';
import NavButton from './NavButton';
import ListView from './ListView';
import EventEmitter from 'eventemitter3';
import axios from 'axios';
class StandardForm extends Component {
  componentWillMount() {
	  var me = this;
	  this.setState({options:this.props.options});
	  this.fields = {};
	  this.handleFormSubmit = this.handleFormSubmit.bind(this)
	  this.handleChange = this.handleChange.bind(this)
	  this.props.options.fields.map((field,i) => {
		  if(field.type == 'selectone' && !field.value && field.options.length) {
			  field.value = field.options[0].value; // default value
		  }
		  me.fields[field.id] = field.value;
	  })
  }
  
  state = {
  
  }
  
  
  render() {
    return (
	  <div>
		<h2>{this.state.options.title}</h2>
		<form>
			<table>
				<tbody>
			{this.props.options.fields.map((field,i) => (
				<tr key={i}>
					<td>{field.label}</td>
					<td>
				      {field.type=="text" && <input type="text" name={field.id} id={field.id} value={field.value} onChange={this.handleChange}/>}
				      {field.type=="selectone" && <select value={field.value} name={field.id} id={field.id} onChange={this.handleChange}>
						  {field.options.map((k,i) => (
							  <option key={i} value={k.value}>{k.key}</option>
						  ))}
					  </select>}
					</td>
				</tr>
			))}
			<tr>
				<td colSpan="2">
					<input type="button" value="Submit" onClick={this.handleFormSubmit}/>
				</td>
			</tr>
				</tbody>
			</table>
		</form>
	  </div>
	  
    );
  }
  
  handleFormSubmit() {
	  this.props.options.onSubmit({fields:this.fields})
  }
  
  handleChange(e) {
	  // set to my own local fields for handleformsubmit
	  this.fields[e.target.id] = e.target.value;
	  
	  // to refresh react state options fields after field change, otherwise cannot change
	  this.state.options.fields.map((field,i) => {
		  if(field.id == e.target.id) {
			  field.value = e.target.value;
		  }
	  })
	  this.setState({options:this.state.options}) // <-- this line is important
  }
}

export default StandardForm;
