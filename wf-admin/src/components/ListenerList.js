import React, { Component } from 'react';
import { Button } from 'reactstrap';
import ListView from './ListView';
import ee from './EventManager';
import Constants from './Constants';
import axios from 'axios';
import ListenerCreateForm from './ListenerCreateForm';
import AppEditForm from './AppEditForm';
import ListenerEditForm from './ListenerEditForm';
class ListenerList extends Component {
  componentWillMount() {
	  this.requestListener()
  }
  componentDidMount() {
	 	
  }
  
  requestListener() {
	  var me = this;
	  axios({
		  method: 'GET',
		  url: Constants.API_URL + '/app/' + this.props.app + '/listener',
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
		{heading:'Endpoint',key:'endpoint'},
		{heading:'Method',key:'method'},
		{heading:'Flow',key:'flow'},
	];
	options.hasEdit = true;
	options.editForm = (row) => <ListenerEditForm app={this.props.app} listener_id={row.id} />
    return (
      <div>
	    <Button color="primary" onClick={() => {ee.emit('navigatePage',{page:<AppEditForm app={this.props.app} />})}}>Back To Edit App</Button>
		<Button color="primary" onClick={() => {ee.emit('navigatePage',{page:<ListenerCreateForm app={this.props.app} />})}}>Create Listener</Button>
		<h3>Listeners</h3>
		<ListView options={options}/>
	  </div>
	  
    );
  }
  
}

export default ListenerList;
