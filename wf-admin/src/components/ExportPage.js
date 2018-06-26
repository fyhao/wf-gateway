import React, { Component } from 'react';
import NavButton from './NavButton';
import { Button } from 'reactstrap';
import ListView from './ListView';
import ee from './EventManager';
import Constants from './Constants';
import axios from 'axios';
class ExportPage extends Component {
  constructor(opts) {
	  super(opts)
	  this.onExportPage = this.onExportPage.bind(this);
  }
  componentWillMount() {
  }
  componentDidMount() {
	  var me = this;
	  
		
  }
  
  componentWillMount() {
	  ee.on('exportPage', this.onExportPage)
  }
  componentWillUnmount() {
	  ee.off('exportPage', this.onExportPage)
  }
  onExportPage(evt) {
	  if(evt.action == 'export') {
		  
	  }
	  else if(evt.action == 'import') {
		  
	  }
  }
  state = {
	 data:[]
  }
  
  
  render() {
	
    return (
      <div>
	  Export Page
	  <hr />
	  <Button color="primary" onClick={() => {ee.emit('exportPage',{action:'export'})}}>Export</Button>
	  <Button color="primary" onClick={() => {ee.emit('exportPage',{action:'import'})}}>Import</Button>
	  TODO: Export btn, import btn, also a textarea display current json structure, with save button... 3 features (at least develop textarea feature first)
	  </div>
	  
    );
  }
  
}

export default ExportPage;
