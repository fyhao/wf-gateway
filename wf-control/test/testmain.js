var assert = require('assert');

var testServerOpts = {};
// setup testswitch
var testDBCfg = {type:'memory'}; // memory, mysql
if(testDBCfg.type == 'mysql') {
	testServerOpts.dbtype = 'mysql';
	testServerOpts.dbhost = 'localhost';
	testServerOpts.dbuser = 'root';
	testServerOpts.dbpass = 'root';
	testServerOpts.dbname = 'testwf';
	
	describe('test db connection', function() {
		it('create test db schema', function test(done) {
			// Create and destroy test db for testing
			var dbLib = require('../lib/dbLib.js');
			var fs = require('fs');
			var sql = fs.readFileSync('lib/datastore/mysql-schema.sql','utf8');
			var ctx = {vars:{}};
			dbLib.query({
				ctx : ctx,
				cfg : {
					type:'mysql',
					host     : testServerOpts.dbhost,
				    user     : testServerOpts.dbuser,
				    password : testServerOpts.dbpass,
				    database : testServerOpts.dbname,
					multipleStatements: true
				},
				sql : sql,
				checkNext : function() {
					done();
				}
			});
		});
	});
}


var request = require('supertest');
describe('loading express', function () {
  var server;
  beforeEach(function () {
    server = require('../server', { bustCache: true })(testServerOpts);
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
    server = require('../server', { bustCache: true })(testServerOpts);
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
  it('should return status 101 after create app detail with same app name', function test() {
    return request(server)
      .post('/app')
	  .send({name:'test'})
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:101}));
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
  it('should return status 100 after create app detail with blank app name', function test() {
    return request(server)
      .post('/app')
	  .send({name:''})
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:100}));
	  });
  });
});

describe('flow module', function () {
  var server;
  before(function () {
    server = require('../server', { bustCache: true })(testServerOpts);
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
	  .send({flows:flows})
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
	  .send({flows:flows})
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
	  .send({flow:flows.flow_1})
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
    server = require('../server', { bustCache: true })(testServerOpts);
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
		endpoint : '/rest/test',
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
		  assert.equal(json.listeners[0].endpoint, '/rest/test');
		  assert.equal(json.listeners[0].flow, 'flow_1');
		  listener_id = json.listeners[0].id;
		  console.log('Temp check listener id: ' + listener_id);
	  });
  });
  it('should return status 0 after update new listener for app test', function test() {
	var listener =  {
		type : 'http',
		endpoint : '/rest/test',
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
		  assert.equal(json.listeners[0].endpoint, '/rest/test');
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
			endpoint : '/rest/test',
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
				  assert.equal(json.listeners[0].endpoint, '/rest/test');
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
  
  var testHttpRequestParam = function(testDesc, params, expectedStatus, assertParams) {
	  var listener_id;
	  it('should return status ' + expectedStatus + ' after create new HTTP listener for request params with ' + testDesc, function test() {
		var listener =  {
			type : 'http',
			endpoint : '/rest/test',
			flow : 'flow_1',
			requestParams : [params]
		};
		return request(server)
		  .post('/app/test/listener')
		  .send({listener:listener})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
				assert.equal(json.status, expectedStatus);
			    if(expectedStatus == 0) {
					listener_id = json.listener.id;
				}
		  });
	  });
  }
  testHttpRequestParam(
    'valid test',
	{name:'lat',condition:'required',type:'text',defaultValue:'1.0',description:'The latitude'},
	0,{condition:'required',type:'text'}
  );
  testHttpRequestParam(
	'condition optional',
	{name:'lat',condition:'optional',type:'text',defaultValue:'1.0',description:'The latitude'},
	0,{condition:'optional',type:'text'}
  );
  testHttpRequestParam(
	'invalid condition',
	{name:'lat',condition:'ddd',type:'text',defaultValue:'1.0',description:'The latitude'},
	103
  );
  testHttpRequestParam(
	'no condition specified',
	{name:'lat',type:'text',defaultValue:'1.0',description:'The latitude'},
	0,{condition:'optional',type:'text'}
  );
  testHttpRequestParam(
	'type number',
	{name:'lat',type:'number',defaultValue:'1.0',description:'The latitude'},
	0,{condition:'optional',type:'number'}
  );
  testHttpRequestParam(
	'type decimal',
	{name:'lat',type:'decimal',defaultValue:'1.0',description:'The latitude'},
	0,{condition:'optional',type:'decimal'}
  );
  testHttpRequestParam(
	'type boolean',
	{name:'lat',type:'boolean',defaultValue:'1.0',description:'The latitude'},
	0,{condition:'optional',type:'boolean'}
  );
  testHttpRequestParam(
	'type invalid',
	{name:'lat',type:'invalid',defaultValue:'1.0',description:'The latitude'},
	104
  );
  testHttpRequestParam(
	'no type specified',
	{name:'lat',defaultValue:'1.0',description:'The latitude'},
	0,{condition:'optional',type:'text'}
  );
  testHttpRequestParam(
	'no defaultValue',
	{name:'lat',description:'The latitude'},
	0,{condition:'optional',type:'text',description:'The latitude'}
  );
  testHttpRequestParam(
	'no description',
	{name:'lat'},
	0,{condition:'optional',type:'text',description:''}
  );
  
  var testHttpRequestHeader = function(testDesc, params, expectedStatus, assertParams) {
	  var listener_id;
	  it('should return status ' + expectedStatus + ' after create new HTTP listener for request headers with ' + testDesc, function test() {
		var listener =  {
			type : 'http',
			endpoint : '/rest/test',
			flow : 'flow_1',
			requestHeaders : [params]
		};
		return request(server)
		  .post('/app/test/listener')
		  .send({listener:listener})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
				assert.equal(json.status, expectedStatus);
			    if(expectedStatus == 0) {
					listener_id = json.listener.id;
				}
		  });
	  });
  }
  testHttpRequestHeader(
    'valid test',
	{name:'lat',condition:'required',type:'text',defaultValue:'1.0',description:'The latitude'},
	0,{condition:'required',type:'text'}
  );
  testHttpRequestHeader(
	'condition optional',
	{name:'lat',condition:'optional',type:'text',defaultValue:'1.0',description:'The latitude'},
	0,{condition:'optional',type:'text'}
  );
  testHttpRequestHeader(
	'invalid condition',
	{name:'lat',condition:'ddd',type:'text',defaultValue:'1.0',description:'The latitude'},
	105
  );
  testHttpRequestHeader(
	'no condition specified',
	{name:'lat',type:'text',defaultValue:'1.0',description:'The latitude'},
	0,{condition:'optional',type:'text'}
  );
  testHttpRequestHeader(
	'type number',
	{name:'lat',type:'number',defaultValue:'1.0',description:'The latitude'},
	0,{condition:'optional',type:'number'}
  );
  testHttpRequestHeader(
	'type decimal',
	{name:'lat',type:'decimal',defaultValue:'1.0',description:'The latitude'},
	0,{condition:'optional',type:'decimal'}
  );
  testHttpRequestHeader(
	'type boolean',
	{name:'lat',type:'boolean',defaultValue:'1.0',description:'The latitude'},
	0,{condition:'optional',type:'boolean'}
  );
  testHttpRequestHeader(
	'type invalid',
	{name:'lat',type:'invalid',defaultValue:'1.0',description:'The latitude'},
	106
  );
  testHttpRequestHeader(
	'no type specified',
	{name:'lat',defaultValue:'1.0',description:'The latitude'},
	0,{condition:'optional',type:'text'}
  );
  testHttpRequestHeader(
	'no defaultValue',
	{name:'lat',description:'The latitude'},
	0,{condition:'optional',type:'text',description:'The latitude'}
  );
  testHttpRequestHeader(
	'no description',
	{name:'lat'},
	0,{condition:'optional',type:'text',description:''}
  );
  
  it('should return status 107 after create new listener with unsupported type', function test() {
	var listener =  {
		type : 'http123',
		endpoint : '/rest/test',
		flow : 'flow_1'
	};
    return request(server)
      .post('/app/test/listener')
	  .send({listener:listener})
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 107);
	  });
  });
}); 

describe('instance module', function () {
  var server;
  before(function () {
    server = require('../server', { bustCache: true })(testServerOpts);
  });
  after(function (done) {
    server.close(done);
  });
  it('should return status 0 with blank instances', function test() {
    return request(server)
      .get('/instance')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:0,instances:[]}));
	  });
  });
  it('should return status 0 after create an instance', function test() {
    return request(server)
      .post('/instance')
	  .send({name:'Dummy Instance','description':'This instance is created for test',host:'192.168.1.2'})
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
		  assert.equal(json.instance.id > 0, true);
		  assert.equal(json.instance.name, 'Dummy Instance');
		  assert.equal(json.instance.description, 'This instance is created for test');
		  assert.equal(json.instance.host, '192.168.1.2');
	  });
  });
  var instance_id;
  it('should return status 0 with one instance', function test() {
    return request(server)
      .get('/instance')
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
		  assert.equal(json.instances.length, 1);
		  assert.equal(json.instances[0].name, 'Dummy Instance');
		  instance_id = json.instances[0].id;
	  });
  });
  it('should return status 0 after update instance', function test() {
    return request(server)
      .put('/instance/' + instance_id)
	  .send({name:'Dummy Instance1','description':'This instance is created for test2',host:'192.168.1.23'})
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
	  });
  });
  it('should return status 0 with one instance', function test() {
    return request(server)
      .get('/instance')
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
		  assert.equal(json.instances.length, 1);
		  assert.equal(json.instances[0].name, 'Dummy Instance1');
	  });
  });
  // app instance mapping start
  it('should return status 0 with blank instances for app test', function test() {
    return request(server)
      .get('/app/test/instance')
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
		  assert.equal(json.instances.length, 0);
	  });
  });
  it('should return status 0 after assign one instance for app test', function test() {
    return request(server)
      .post('/app/test/instance/' + instance_id)
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
	  });
  });
  it('should return status 101 after assign same instance for app test', function test() {
    return request(server)
      .post('/app/test/instance/' + instance_id)
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 101);
	  });
  });
  it('should return status 0 with one instances for app test', function test() {
    return request(server)
      .get('/app/test/instance')
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
		  assert.equal(json.instances.length, 1);
	  });
  });
  it('should return status 0 with list of apps assigned to this instance', function test() {
    return request(server)
      .get('/instance/' + instance_id + '/app')
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
		  assert.equal(json.apps.length, 1);
		  assert.equal(json.apps[0].app, 'test');
		  assert.equal(json.apps[0].status, 'disabled');
	  });
  });
  it('should return status 0 after enable app for this instance', function test() {
    return request(server)
      .post('/instance/' + instance_id + '/app/test/enable')
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
	  });
  });
  it('should return status 0 with list of apps assigned to this instance with status enabled', function test() {
    return request(server)
      .get('/instance/' + instance_id + '/app')
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
		  assert.equal(json.apps.length, 1);
		  assert.equal(json.apps[0].app, 'test');
		  assert.equal(json.apps[0].status, 'enabled');
	  });
  });
  it('should return status 0 after disable app for this instance', function test() {
    return request(server)
      .post('/instance/' + instance_id + '/app/test/disable')
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
	  });
  });
  it('should return status 0 with list of apps assigned to this instance with status disabled', function test() {
    return request(server)
      .get('/instance/' + instance_id + '/app')
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
		  assert.equal(json.apps.length, 1);
		  assert.equal(json.apps[0].app, 'test');
		  assert.equal(json.apps[0].status, 'disabled');
	  });
  });
  // delete instance for app
  it('should return status 0 after delete one instance for app test', function test() {
    return request(server)
      .delete('/app/test/instance/' + instance_id)
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
	  });
  });
  it('should return status 102 after delete same instance again for app test', function test() {
    return request(server)
      .delete('/app/test/instance/' + instance_id)
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 102);
	  });
  });
  it('should return status 0 with blank instances for app test', function test() {
    return request(server)
      .get('/app/test/instance')
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
		  assert.equal(json.instances.length, 0);
	  });
  });
  // app instance mapping end
  it('should return status 0 after delete instance', function test() {
    return request(server)
      .delete('/instance/' + instance_id)
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
	  });
  });
  it('should return status 0 with one instance', function test() {
    return request(server)
      .get('/instance')
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
		  assert.equal(json.instances.length, 0);
	  });
  });
}); 
