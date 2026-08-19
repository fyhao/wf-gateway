import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import FlowEditor from './FlowEditor';

jest.mock('axios', () => jest.fn(() => Promise.resolve({data:{flows:{},instances:[]}})));

it('renders the flow editor without automatically deploying to every instance', () => {
  const div = document.createElement('div');
  ReactDOM.render(<FlowEditor app="demo" />, div);
  expect(div.textContent).toContain('Flows');
  expect(axios).toHaveBeenCalled();
  ReactDOM.unmountComponentAtNode(div);
});
