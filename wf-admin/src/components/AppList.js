import React, { Component } from 'react';
import NavButton from './NavButton';
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
			var rows = me.state.rows;
			me.setState({rows:rows,data:response.data})
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
	options.editForm = <AppEditForm />
    return (
      <div>App Form
	  <NavButton onClick={() => {ee.emit('navigatePage',{page:<AppCreateForm />})}} title="Create Apps"/>
	  
	  <ListView options={options}/>
	  </div>
	  
    );
  }
  
}

export default AppList;
