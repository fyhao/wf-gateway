import React, { Component } from 'react';
import ee from './EventManager';
class ListView extends Component {
  render() {
	 const options = this.props.options;
	 const fields = options.fields;
	 const data = options.data;
    return (
      <div>
		<table border="1">
			<thead><tr>
		{fields.map((field,i) => {
			return (<td key={i}>{field.heading}</td>)
		})}
			{options.hasEdit && <td>Edit</td>}
		
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
		  
		  {options.hasEdit && <td><button onClick={this.onEdit(row)}>Edit</button></td>}
		  
		  </tr>)
		})}
		</tbody>
		</table>
	  
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
