import React, { Component } from 'react';
import NavButton from './NavButton';
import { Container, Row, Col, Badge, Button,Form, FormGroup, Label, Input, FormText, Alert, Card, CardBody, CardText, CardTitle } from 'reactstrap';
import ListView from './ListView';
import ee from './EventManager';
import Constants from './Constants';
import axios from 'axios';
class ExportPage extends Component {
  constructor(opts) {
	  super(opts)
	  this.onExportPage = this.onExportPage.bind(this);
	  this.onChangeTA = this.onChangeTA.bind(this);
  }
  componentWillMount() {
	  ee.on('exportPage', this.onExportPage)
  }
  componentWillUnmount() {
	  ee.off('exportPage', this.onExportPage)
  }
  onExportPage(evt) {
	  if(evt.action == 'export') {
		  this.exportJSONIntoTextArea();
	  }
	  else if(evt.action == 'import') {
		  this.importJSONFromTextArea()
	  }
  }
  exportJSONIntoTextArea() {
	  var me = this;
	  axios({
		  method: 'GET',
		  url: Constants.API_URL + '/backup/export',
		  data: {
			  
		  }
		}).then(response => {
			var result = response.data;
			this.state.ta = JSON.stringify(result);
			this.setState({ta:this.state.ta})
		})
  }
  importJSONFromTextArea() {
	  var me = this;
	  axios({
		  method: 'POST',
		  url: Constants.API_URL + '/backup/import',
		  data: {
			  input: this.state.ta
		  }
		}).then(response => {
			var status = response.data.status;
			if(status == 0) {
				alert("Import OK");
			}
			else {
				alert("Import failed");
			}
		})
  }
  state = {
	 ta : ''
  }
  onChangeTA(evt) {
	  this.state.ta = evt.target.value;
	  this.setState({ta:this.state.ta})
  }
  
  
  render() {
	
    return (
      <div>
	  Export Page
	  <hr />
	  <Button color="primary" onClick={() => {ee.emit('exportPage',{action:'export'})}}>Export</Button>
	  <Button color="primary" onClick={() => {ee.emit('exportPage',{action:'import'})}}>Import</Button>
	  TODO: Export btn, import btn, also a textarea display current json structure, with save button... 3 features (at least develop textarea feature first)
	  
	  <Input type="textarea" value={this.state.ta} onChange={this.onChangeTA}/>
	  
	  </div>
	  
    );
  }
  
}

export default ExportPage;
