var assert = require('assert');

var request = require('supertest');
describe('loading express', function () {
  var server;
  beforeEach(function () {
    server = require('../server', { bustCache: true })();
  });
  afterEach(function (done) {
    server.close(done);
  });
  it('responds to /', function testSlash(done) {
    request(server)
      .get('/')
      .expect(200, done);
  });
  it('404 everything else', function testPath(done) {
    console.log('test 404')
    request(server)
      .get('/foo/bar')
      .expect(404, done);
  });
  
});

describe('app module', function () {
  var server;
  before(function () {
    server = require('../server', { bustCache: true })();
  });
  after(function (done) {
    server.close(done);
  });
  it('should return blank list initially', function test() {
    return request(server)
      .get('/app')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify([]))
	  });
  });
  it('should return error status when query for app with name test', function test() {
    return request(server)
      .get('/app/test')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:100}));
	  });
  });
  it('should return status 0 after create an app with name test', function test() {
    return request(server)
      .post('/app')
	  .send({name:'test','description':'This is a test app'})
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:0}));
	  });
  });
  it('should return a list of apps include the app name with test', function test() {
    return request(server)
      .get('/app')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify([{name:'test','description':'This is a test app'}]))
	  });
  });
  it('should return valid result when query for app with name test', function test() {
    return request(server)
      .get('/app/test')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({name:'test','description':'This is a test app'}));
	  });
  });
  it('should return invalid result when query for app with name test1 (not exist)', function test() {
    return request(server)
      .get('/app/test1')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:100}));
	  });
  });
  it('should return status 0 after update app detail for test', function test() {
    return request(server)
      .put('/app/test')
	  .send({'fields': {'description':'Changed desc'}})
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:0}));
	  });
  });
  it('should return updated result when query for app with name test after info updated', function test() {
    return request(server)
      .get('/app/test')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({name:'test','description':'Changed desc'}));
	  });
  });
  it('should return status 0 after request to delete for app with name test', function test() {
    return request(server)
      .delete('/app/test')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:0}));
	  });
  });
  it('should return blank list after deleted app', function test() {
    return request(server)
      .get('/app')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify([]))
	  });
  });
  it('should return status 100 after request to delete for app with name test (not exist now)', function test() {
    return request(server)
      .delete('/app/test')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:100}));
	  });
  });
  it('should return status 100 after update app detail for test1 (not exist)', function test() {
    return request(server)
      .put('/app/test1')
	  .send({'fields': {'description':'Changed desc'}})
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:100}));
	  });
  });
});

describe('flow module', function () {
  var server;
  before(function () {
    server = require('../server', { bustCache: true })();
  });
  after(function (done) {
    server.close(done);
  });
  it('should return status 0 after create an app with name test', function test() {
    return request(server)
      .post('/app')
	  .send({name:'test','description':'This is a test app'})
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:0}));
	  });
  });
  it('should return status 0 with blank flows for app test', function test() {
    return request(server)
      .get('/app/test/flow')
      .expect(200)
	  .expect(function(res) {
		  var expected = {status:0, flows:{}};
		  assert.equal(res.text, JSON.stringify(expected));
	  });
  });
  it('should return status 0 after create flow for app test', function test() {
	var flows = {
		flow_1 : {
			steps: [
				{type:'log',log:'Hello world'},
				{type:'response',body:'This is the response printed from API'}
			]
		}
	};
    return request(server)
      .post('/app/test/flow')
	  .send({app:'test',flows:flows})
      .expect(200)
	  .expect(function(res) {
		  var expected = {status:0};
		  assert.equal(res.text, JSON.stringify(expected));
	  });
  });
  it('should return status 0 with flows for app test', function test() {
    return request(server)
      .get('/app/test/flow')
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
		  assert.equal(json.flows.flow_1.steps.length, 2);
	  });
  });
  it('should return status 0 after update entire flow definition for app test', function test() {
	var flows = {
		flow_1 : {
			steps: [
				{type:'log',log:'Hello world'},
				{type:'log',log:'updated'},
				{type:'response',body:'This is the response printed from API'}
			]
		}
	};
    return request(server)
      .put('/app/test/flow')
	  .send({app:'test',flows:flows})
      .expect(200)
	  .expect(function(res) {
		  var expected = {status:0};
		  assert.equal(res.text, JSON.stringify(expected));
	  });
  });
  it('should return status 0 with updated flows for app test', function test() {
    return request(server)
      .get('/app/test/flow')
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
		  assert.equal(json.flows.flow_1.steps.length, 3);
	  });
  });
  it('should return status 0 after update single flow definition for app test', function test() {
	var flows = {
		flow_1 : {
			steps: [
				{type:'log',log:'Hello world'},
				{type:'log',log:'updated'},
				{type:'log',log:'updated2'},
				{type:'response',body:'This is the response printed from API'}
			]
		}
	};
    return request(server)
      .put('/app/test/flow/flow_1')
	  .send({app:'test',flow:flows.flow_1})
      .expect(200)
	  .expect(function(res) {
		  var expected = {status:0};
		  assert.equal(res.text, JSON.stringify(expected));
	  });
  });
  it('should return status 0 with updated flows for app test', function test() {
    return request(server)
      .get('/app/test/flow')
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
		  assert.equal(json.flows.flow_1.steps.length, 4);
	  });
  });
  it('should return status 0 with single flow definition from app', function test() {
	var flows = {
		flow_1 : {
			steps: [
				{type:'log',log:'Hello world'},
				{type:'log',log:'updated'},
				{type:'log',log:'updated2'},
				{type:'response',body:'This is the response printed from API'}
			]
		}
	};
    return request(server)
      .get('/app/test/flow/flow_1')
      .expect(200)
	  .expect(function(res) {
		  var expected = {status:0,flow:flows.flow_1};
		  assert.equal(res.text, JSON.stringify(expected));
	  });
  });
  it('should return status 0 with delete single flow from app', function test() {
    return request(server)
      .delete('/app/test/flow/flow_1')
      .expect(200)
	  .expect(function(res) {
		  var expected = {status:0};
		  assert.equal(res.text, JSON.stringify(expected));
	  });
  });
  it('should return status 0 with blank flows for app test', function test() {
    return request(server)
      .get('/app/test/flow')
      .expect(200)
	  .expect(function(res) {
		  var expected = {status:0, flows:{}};
		  assert.equal(res.text, JSON.stringify(expected));
	  });
  });
});


describe('listeners module', function () {
  var server;
  before(function () {
    server = require('../server', { bustCache: true })();
  });
  after(function (done) {
    server.close(done);
  });
  it('should return status 0 with blank listeners for app test', function test() {
    return request(server)
      .get('/app/test/listener')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:0,listeners:[]}));
	  });
  });
  it('should return status 0 after create new listener for app test', function test() {
	var listener =  {
		type : 'http',
		endpoint : 'http://example.com',
		flow : 'flow_1'
	};
    return request(server)
      .post('/app/test/listener')
	  .send({listener:listener})
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
	  });
  });
  var listener_id = 0;
  it('should return status 0 with one listener for app test', function test() {
    return request(server)
      .get('/app/test/listener')
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
		  assert.equal(json.listeners.length, 1);
		  assert.equal(json.listeners[0].type, 'http');
		  assert.equal(json.listeners[0].endpoint, 'http://example.com');
		  assert.equal(json.listeners[0].flow, 'flow_1');
		  listener_id = json.listeners[0].id;
		  console.log('Temp check listener id: ' + listener_id);
	  });
  });
  it('should return status 0 after update new listener for app test', function test() {
	var listener =  {
		type : 'http',
		endpoint : 'http://example.com/test',
		flow : 'flow_1'
	};
    return request(server)
      .put('/app/test/listener/' + listener_id)
	  .send({listener:listener})
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:0}));
	  });
  });
  it('should return status 0 with one listener for app test after update', function test() {
    return request(server)
      .get('/app/test/listener')
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
		  assert.equal(json.listeners.length, 1);
		  assert.equal(json.listeners[0].type, 'http');
		  assert.equal(json.listeners[0].endpoint, 'http://example.com/test');
		  assert.equal(json.listeners[0].flow, 'flow_1');
		  listener_id = json.listeners[0].id;
	  });
  });
  it('should return status 0 after delete new listener for app test', function test() {
    return request(server)
      .delete('/app/test/listener/' + listener_id)
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:0}));
	  });
  });
  it('should return status 0 with blank listeners for app test after deleted', function test() {
    return request(server)
      .get('/app/test/listener')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:0,listeners:[]}));
	  });
  });
  // validation http based endpoint
  var testHttpMethod = function(method) {
	  var temp1 = '';
	  var temp2 = '';
	  var temp3 = '';
	  var temp4 = 0;
	  if(method == '') {
		  temp1 = 'with no method specified';
		  temp2 = 'with default method GET';
		  temp3 = 'GET';
		  temp4 = 0;
	  }
	  else if(method == 'GET' || method == 'POST' || method == 'PUT' || method == 'DELETE') {
		  temp1 = 'with method ' + method;
		  temp2 = temp1;
		  temp3 = method;
		  temp4 = 0;
	  }
	  else {
		  temp1 = 'with method ' + method;
		  temp2 = 'with error returned not supported';
		  temp4 = 101;
	  }
	  it('should return status ' + temp4 + ' after create new HTTP listener ' + temp1, function test() {
		var listener =  {
			type : 'http',
			endpoint : 'http://example.com',
			flow : 'flow_1'
		};
		if(method != '') {
			listener.method = method;
		}
		return request(server)
		  .post('/app/test/listener')
		  .send({listener:listener})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
				assert.equal(json.status, temp4);
		  });
	  });
	  var listener_id = 0;
	  if(temp4 == 0) {
		  it('should return status 0 with one HTTP listener ' + temp2, function test() {
			return request(server)
			  .get('/app/test/listener')
			  .expect(200)
			  .expect(function(res) {
				  var json = JSON.parse(res.text);
				  assert.equal(json.status, 0);
				  assert.equal(json.listeners.length, 1);
				  assert.equal(json.listeners[0].type, 'http');
				  assert.equal(json.listeners[0].endpoint, 'http://example.com');
				  assert.equal(json.listeners[0].flow, 'flow_1');
				  assert.equal(json.listeners[0].method, temp3);
				  listener_id = json.listeners[0].id;
				  console.log('Temp check listener id: ' + listener_id);
			  });
		  });
		  it('should return status 0 after delete new listener for app test', function test() {
			return request(server)
			  .delete('/app/test/listener/' + listener_id)
			  .expect(200)
			  .expect(function(res) {
				  assert.equal(res.text, JSON.stringify({status:0}));
			  });
		  });
	  }
	  
  }
  testHttpMethod('');
  testHttpMethod('GET');
  testHttpMethod('POST');
  testHttpMethod('PUT');
  testHttpMethod('DELETE');
  testHttpMethod('SOMEOTHER');
  
  var testHttpEndpoint = function(endpoint, desc, a) {
	  var temp1 = 102;
	  if(a) temp1 = 0;
	  it('should return status ' + temp1 + ' after create new HTTP listener with ' + desc, function test() {
		var listener =  {
			type : 'http',
			flow : 'flow_1'
		};
		if(endpoint != '') {
			listener.endpoint = endpoint;
		}
		return request(server)
		  .post('/app/test/listener')
		  .send({listener:listener})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
				assert.equal(json.status, temp1);
		  });
	  });
  }
  testHttpEndpoint('', 'no endpoint specified', false);
  testHttpEndpoint('ftp://example.com', 'invalid endpoint prefix specified', false);
  testHttpEndpoint('http://example.com', 'valid endpoint specified: http', true);
  testHttpEndpoint('https://example.com', 'valid endpoint specified: https', true);
}); 