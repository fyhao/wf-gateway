import axios from 'axios';
import ee from './EventManager';
const Constants = { API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080' };
// Memory-only bearer tokens; never persist credentials or attach tokens to foreign URLs.
let token = null;
Constants.setToken = value => { token = value; };
function isControlURL(url) {
  const target = new URL(url || '/', window.location.href);
  const base = new URL(Constants.API_URL, window.location.href);
  return target.origin === base.origin && (base.pathname === '/' || target.pathname === base.pathname || target.pathname.startsWith(base.pathname.replace(/\/$/, '') + '/'));
}
axios.interceptors.request.use(config => {
  if (token && isControlURL(config.url)) config.headers = Object.assign({}, config.headers, { Authorization: 'Bearer ' + token });
  return config;
});
axios.interceptors.response.use(response => response, error => {
  if (error.response && error.response.status === 401 && isControlURL(error.config && error.config.url)) {
    token = null; ee.emit('sessionExpired');
  }
  return Promise.reject(error);
});
export default Constants;
