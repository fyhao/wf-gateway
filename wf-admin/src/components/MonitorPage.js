import React, { Component } from 'react';
import NavButton from './NavButton';
import { Container, Row, Col, Badge, Button,Form, FormGroup, Label, Input, FormText, Alert, Card, CardBody, CardText, CardTitle } from 'reactstrap';
import ListView from './ListView';
import ee from './EventManager';
import Constants from './Constants';
import axios from 'axios';
class MonitorPage extends Component {
  constructor(opts) {
	  super(opts)
	  this.onMonitorPage = this.onMonitorPage.bind(this);
  }
  componentWillMount() {
	  ee.on('monitorPage', this.onMonitorPage)
	  this.pollForDataUpdate();
  }
  componentWillUnmount() {
	  ee.off('monitorPage', this.onMonitorPage)
	  this.stopForDataUpdate()
  }
  onMonitorPage(evt) {
  }
  pollForDataUpdate() {
	  var me = this;
	  var fn = function() {
		  axios({
			  method: 'GET',
			  url: Constants.API_URL + '/monitor/info',
			  data: {
			  }
			}).then(response => {
				if(response.data.length > 0) {
					var data = response.data;
					var firstRow = response.data[0];
					var fields = [];
					for(var key in firstRow) {
						fields.push({heading:key,key:key});
					}
					for(var i = 0; i < data.length; i++) {
						
						// convert flowData object into string
						var flowDataStr = '';
						var flowData = data[i]['flowData'];
						for(var flow in flowData) {
							var cnt = flowData[flow];
							flowDataStr += flow + '-' + cnt + ' ';
						}
						data[i]['flowData'] = flowDataStr;
					}
					var options = {data:data,fields:fields};
					me.setState({options:options});
				}
			})
	  };
	  setTimeout(fn, 100);
	  me.rt = setInterval(fn, 60000);
  }
  stopForDataUpdate() {
	  var me = this;
	  if(me.rt != null) {
		  clearInterval(me.rt);
		  me.rt = null;
	  }
  }
  state = {
	options:{
		data : [],
		fields : []
	}
  }
  
  
  
  render() {
    var me = this;
	var options = {};
	options.data = me.state.options.data;
	options.fields = me.state.options.fields;
    return (
      <div>
	  Monitoring Page
	  <ListView options={options}/>
	  </div>
	  
    );
  }
  
}

export default MonitorPage;
