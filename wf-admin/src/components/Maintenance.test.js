import React from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import axios from 'axios';
import LoginGate from './LoginGate';
import LogsPage from './LogsPage';
import Constants from './Constants';
jest.mock('axios', () => ({get:jest.fn(),post:jest.fn(),interceptors:{request:{use:jest.fn()},response:{use:jest.fn()}}}));
let div;
beforeEach(() => { div=document.createElement('div');document.body.appendChild(div); });
afterEach(() => { ReactDOM.unmountComponentAtNode(div);div.remove(); });
it('requires login before rendering the administration UI and supports logout', async () => {
  axios.get.mockResolvedValue({data:{enabled:true}});
  axios.post.mockResolvedValue({data:{accessToken:'test-token'}});
  const setToken=jest.spyOn(Constants,'setToken');
  await act(async()=>{ReactDOM.render(<LoginGate><p>Private admin</p></LoginGate>,div);});
  expect(div.textContent).not.toContain('Private admin');
  await act(async()=>{Simulate.submit(div.querySelector('form'));});
  expect(setToken).toHaveBeenCalledWith('test-token');
  expect(div.textContent).toContain('Private admin');
  await act(async()=>{Simulate.click(div.querySelector('button'));});
  expect(div.textContent).toContain('WF Gateway sign in');
  expect(setToken).toHaveBeenCalledWith(null);
  setToken.mockRestore();
});
it('keeps authentication errors visible and does not render private content',async()=>{
  axios.get.mockResolvedValue({data:{enabled:true}});axios.post.mockRejectedValue(new Error('denied'));
  await act(async()=>{ReactDOM.render(<LoginGate><p>Private admin</p></LoginGate>,div);});
  await act(async()=>{Simulate.submit(div.querySelector('form'));});
  expect(div.querySelector('[role="alert"]').textContent).toContain('Sign-in failed');
  expect(div.textContent).not.toContain('Private admin');
});
it('selects an instance, retrieves a bounded log tail and renders messages as text',async()=>{
  axios.get.mockResolvedValueOnce({data:{instances:[{id:7,name:'runtime'}]}})
    .mockResolvedValueOnce({data:{logs:[{timestamp:'now',app:'demo',flow:'main',message:'<script>not HTML</script>'}]}});
  await act(async()=>{ReactDOM.render(<LogsPage/>,div);});
  await act(async()=>{Simulate.change(div.querySelector('select'),{target:{value:'7'}});});
  await act(async()=>{Simulate.submit(div.querySelector('form'));});
  expect(axios.get).toHaveBeenLastCalledWith(Constants.API_URL+'/instance/7/logs',{params:{limit:100}});
  expect(div.querySelector('pre').textContent).toContain('<script>not HTML</script>');
  expect(div.querySelector('script')).toBeNull();
});
