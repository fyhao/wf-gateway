import React, { Component } from 'react';
import NavButton from './NavButton';
import { Button } from 'reactstrap';
import ListView from './ListView';
import InstanceCreateForm from './InstanceCreateForm';
import InstanceEditForm from './InstanceEditForm';
import ee from './EventManager';
import Constants from './Constants';
import axios from 'axios';
class InstanceList extends Component {
  componentWillMount() {
  }
  componentDidMount() {
	  var me = this;
	  axios.get(Constants.API_URL + '/instance')
	    .then(response => {
			me.setState({data:response.data.instances})
		})
		
  }
  
  state = {
	 data:[]
  }
  
  
  render() {
	var options = {};
	
	options.data = this.state.data;
	options.fields = [
		{heading:'Name',key:'name'},
		{heading:'Description',key:'description'},
		{heading:'Host',key:'host'},
	];
	
	options.hasEdit = true;
	options.editForm = (row) => <InstanceEditForm id={row.id} />
    return (
      <div>
	  <Button color="primary" onClick={() => {ee.emit('navigatePage',{page:<InstanceCreateForm />})}}>Create Instance</Button>
	  
	  <ListView options={options}/>
	  </div>
	  
    );
  }
  
}

export default InstanceList;
