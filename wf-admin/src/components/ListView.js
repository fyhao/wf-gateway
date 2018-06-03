import React, { Component } from 'react';
import { Table,Button } from 'reactstrap';
import ee from './EventManager';
class ListView extends Component {
  render() {
	 const options = this.props.options;
	 const fields = options.fields;
	 const data = options.data;
    return (
      <div>
		<Table>
			<thead><tr>
		{fields.map((field,i) => {
			return (<th key={i}>{field.heading}</th>)
		})}
			{options.hasEdit && <th>Edit</th>}
		
			</tr></thead>
			<tbody>
		{data.map((row,i) => {
	      var rowItems = [];
		  fields.map((field,i) => {
			  rowItems.push(row[field.key])
		  })
		  return (<tr key={i}>
		  {rowItems.map((col,j) => {
			  return (<td key={j}>{col}</td>)
		  })}
		  
		  {options.hasEdit && <td><Button onClick={this.onEdit(row)} outline color="primary">Edit</Button></td>}
		  
		  </tr>)
		})}
		</tbody>
		</Table>
	  
	  </div>
    );
  }
  
  onEdit(row) {
	  const options = this.props.options;
	  return () => {
		  ee.emit('navigatePage', {page:options.editForm(row),row:row});
	  };
  }
  
}

export default ListView;
