import React, { Component } from 'react';
import NavButton from './NavButton';
import { Button } from 'reactstrap';
import ListView from './ListView';
import AppCreateForm from './AppCreateForm';
import AppEditForm from './AppEditForm';
import ee from './EventManager';
import Constants from './Constants';
import axios from 'axios';
class AppList extends Component {
  componentWillMount() {
  }
  componentDidMount() {
	  var me = this;
	  axios.get(Constants.API_URL + '/app')
	    .then(response => {
			me.setState({data:response.data})
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
		{heading:'Description',key:'description'}
	];
	
	options.hasEdit = true;
	options.editForm = (row) => <AppEditForm row={row} />
    return (
      <div>
	  <Button color="primary" onClick={() => {ee.emit('navigatePage',{page:<AppCreateForm />})}}>Create Apps</Button>
	  
	  <ListView options={options}/>
	  </div>
	  
    );
  }
  
}

export default AppList;
