var assert = require('assert');

var request = require('supertest');
describe('loading express', function () {
  var control_server;
  var app_server;
  before(function () {
    control_server = require('../../wf-control/server', { bustCache: true })();
	app_server = require('../../wf-app/server', { bustCache: true })();
  });
  after(function (done) {
	var numOfDone = 0;
	var checkDone = function() {
		numOfDone++;
		if(numOfDone == 2) done();
	}
    control_server.close(checkDone);
	app_server.close(checkDone);
  });
  it('control server responds to /', function testSlash(done) {
    request(control_server)
      .get('/')
      .expect(200, done);
  });
  it('control server 404 everything else', function testPath(done) {
    console.log('test 404')
    request(control_server)
      .get('/foo/bar')
      .expect(404, done);
  });
  it('app server responds to /', function testSlash(done) {
    request(app_server)
      .get('/')
      .expect(200, done);
  });
  it('app server 404 everything else', function testPath(done) {
    console.log('test 404')
    request(app_server)
      .get('/foo/bar')
      .expect(404, done);
  });
});

describe('e2e test - control server push configuration to app server', function () {
  var control_server;
  var app_server;
  before(function () {
    control_server = require('../../wf-control/server', { bustCache: true })();
	app_server = require('../../wf-app/server', { bustCache: true })();
  });
  after(function (done) {
    var numOfDone = 0;
	var checkDone = function() {
		numOfDone++;
		if(numOfDone == 2) done();
	}
    control_server.close(checkDone);
	app_server.close(checkDone);
  });
  it('should return status 0 after create an app with name test', function test() {
    return request(control_server)
      .post('/app')
	  .send({name:'test','description':'This is a test app'})
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:0}));
	  });
  });
  
  it('should return status 0 after create flow for app test', function test() {
	var flows = {
		flow_1 : {
			steps: [
				{type:'log',log:'Hello world'},
				{type:'response',body:'This is the response printed from API'}
			]
		},
		flow_app_init : {
			steps: [
				{type:'log',log:'Hello world'}
			]
		}
	};
    return request(control_server)
      .post('/app/test/flow')
	  .send({flows:flows})
      .expect(200)
	  .expect(function(res) {
		  var expected = {status:0};
		  assert.equal(res.text, JSON.stringify(expected));
	  });
  });
  
  it('should return status 0 after create new listener for app test', function test() {
	var listener =  {
		type : 'http',
		endpoint : '/rest/test',
		flow : 'flow_1'
	};
    return request(control_server)
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
    return request(control_server)
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
  it('should return status 0 after create an instance', function test() {
    return request(control_server)
      .post('/instance')
	  .send({name:'Dummy Instance','description':'This instance is created for test',host:'http://localhost:8081'})
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
		  assert.equal(json.instance.id > 0, true);
		  assert.equal(json.instance.name, 'Dummy Instance');
		  assert.equal(json.instance.description, 'This instance is created for test');
		  assert.equal(json.instance.host, 'http://localhost:8081');
	  });
  });
  var instance_id;
  it('should return status 0 with one instance', function test() {
    return request(control_server)
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
  it('should return status 0 after assign one instance for app test', function test() {
    return request(control_server)
      .post('/app/test/instance/' + instance_id)
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
	  });
  });
  it('should return status 0 after enable app for this instance', function test() {
    return request(control_server)
      .post('/instance/' + instance_id + '/app/test/enable')
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
	  });
  });
  
  // Deployment e2e
  it('should return status 0 after calling deploy with action test', function test() {
	var conf = {
		action : 'test'
	};
    return request(control_server)
      .post('/instance/' + instance_id + '/deploy')
	  .send({conf:conf})
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
		  assert.equal(json.appResponse.status, 0);
		  assert.equal(json.appResponse.action, 'test');
	  });
  });
  it('should return status 0 after calling deploy with action deployAll', function test() {
	var conf = {
		action : 'deployAll'
	};
    return request(control_server)
      .post('/instance/' + instance_id + '/deploy')
	  .send({conf:conf})
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
		  assert.equal(json.appResponse.status, 0);
		  assert.equal(json.appResponse.action, 'deployAll');
	  });
  });
  it('should return status 0 after check deployed status on apps', function test() {
	var conf = {
		action : 'check'
	};
    return request(app_server)
      .post('/control/deploy')
	  .send({conf:conf})
      .expect(200)
	  .expect(function(res) {
		  var json = JSON.parse(res.text);
		  assert.equal(json.status, 0);
		  assert.equal(json.apps[0].app, 'test')
		  assert.equal(json.apps[0].flows.flow_1.steps.length > 0, true)
		  assert.equal(json.apps[0].listeners.length, 1)
	  });
  });
  
  it('should return status 0 after request workflow from apps with endpoint /rest/test', function test() {
    return request(app_server)
      .get('/rest/test')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text,"This is the response printed from API")
	  });
  });
  
  describe('e2e test - manage routing test', function () {
	  it('should return status 0 after update new listener endpoint to /rest/test1 for app test', function test() {
		var listener =  {
			type : 'http',
			endpoint : '/rest/test1',
			flow : 'flow_1'
		};
		return request(control_server)
		  .put('/app/test/listener/' + listener_id)
		  .send({listener:listener})
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text, JSON.stringify({status:0}));
		  });
	  });
	  it('should return status 0 after calling deploy with action deployAll', function test() {
		var conf = {
			action : 'deployAll'
		};
		return request(control_server)
		  .post('/instance/' + instance_id + '/deploy')
		  .send({conf:conf})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.appResponse.status, 0);
			  assert.equal(json.appResponse.action, 'deployAll');
		  });
	  });
	  it('should return HTTP status 404 after request workflow from apps with endpoint /rest/test', function test() {
		return request(app_server)
		  .get('/rest/test')
		  .expect(404)
	  });
	  
	  it('should return status 0 after request workflow from apps with endpoint /rest/test1', function test() {
		return request(app_server)
		  .get('/rest/test1')
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text,"This is the response printed from API")
		  });
	  });
  });
  
  describe('e2e test - manage routing 2nd apps', function() {
	  it('should return status 0 after create an app with name test2', function test() {
		return request(control_server)
		  .post('/app')
		  .send({name:'test2','description':'This is a test app'})
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text, JSON.stringify({status:0}));
		  });
	  });
	  
	  it('should return status 0 after create flow for app test', function test() {
		var flows = {
			flow_2 : {
				steps: [
					{type:'log',log:'Hello world'},
					{type:'response',body:'This is the response printed from API 2'}
				]
			}
		};
		return request(control_server)
		  .post('/app/test2/flow')
		  .send({flows:flows})
		  .expect(200)
		  .expect(function(res) {
			  var expected = {status:0};
			  assert.equal(res.text, JSON.stringify(expected));
		  });
	  });
	  
	  it('should return status 0 after create new listener for app test', function test() {
		var listener =  {
			type : 'http',
			endpoint : '/rest/test2',
			flow : 'flow_2'
		};
		return request(control_server)
		  .post('/app/test2/listener')
		  .send({listener:listener})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  var listener_id2 = 0;
	  it('should return status 0 with one listener for app test2', function test() {
		return request(control_server)
		  .get('/app/test2/listener')
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.listeners.length, 1);
			  assert.equal(json.listeners[0].type, 'http');
			  assert.equal(json.listeners[0].endpoint, '/rest/test2');
			  assert.equal(json.listeners[0].flow, 'flow_2');
			  listener_id2 = json.listeners[0].id;
			  console.log('Temp check listener id: ' + listener_id2);
		  });
	  });
	  it('should return status 0 after assign one instance for app test2', function test() {
		return request(control_server)
		  .post('/app/test2/instance/' + instance_id)
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  it('should return status 0 after enable app for this instance', function test() {
		return request(control_server)
		  .post('/instance/' + instance_id + '/app/test2/enable')
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  it('should return status 0 after calling deploy with action deployAll', function test() {
		var conf = {
			action : 'deployAll'
		};
		return request(control_server)
		  .post('/instance/' + instance_id + '/deploy')
		  .send({conf:conf})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.appResponse.status, 0);
			  assert.equal(json.appResponse.action, 'deployAll');
		  });
	  });
	  it('should return status 0 after request workflow from apps with endpoint /rest/test1', function test() {
		return request(app_server)
		  .get('/rest/test1')
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text,"This is the response printed from API")
		  });
	  });
	  it('should return status 0 after request workflow from apps with endpoint /rest/test2', function test() {
		return request(app_server)
		  .get('/rest/test2')
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text,"This is the response printed from API 2")
		  });
	  });
	  
  
  
	  it('should return status 0 after update new listener endpoint to /rest/test11 for app test', function test() {
		var listener =  {
			type : 'http',
			endpoint : '/rest/test11',
			flow : 'flow_1'
		};
		return request(control_server)
		  .put('/app/test/listener/' + listener_id)
		  .send({listener:listener})
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text, JSON.stringify({status:0}));
		  });
	  });
	  
	  it('should return status 0 with one listener for app test', function test() {
		return request(control_server)
		  .get('/app/test/listener')
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.listeners.length, 1);
			  assert.equal(json.listeners[0].type, 'http');
			  assert.equal(json.listeners[0].endpoint, '/rest/test11');
			  assert.equal(json.listeners[0].flow, 'flow_1');
		  });
	  });
  
  
	  it('should return status 0 after calling deploy with action deployAll', function test() {
		var conf = {
			action : 'deployAll'
		};
		return request(control_server)
		  .post('/instance/' + instance_id + '/deploy')
		  .send({conf:conf})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.appResponse.status, 0);
			  assert.equal(json.appResponse.action, 'deployAll');
		  });
	  });
	  it('should return HTTP status 404 after request workflow from apps with endpoint /rest/test1', function test() {
		return request(app_server)
		  .get('/rest/test1')
		  .expect(404)
	  });
	  it('should return HTTP status 200 after request workflow from apps with endpoint /rest/test11', function test() {
		return request(app_server)
		  .get('/rest/test11')
		  .expect(200)
	  });
	  
	  it('should return HTTP status 200 after request workflow from apps with endpoint /rest/test2', function test() {
		return request(app_server)
		  .get('/rest/test2')
		  .expect(200)
	  });
	  
	  it('should return status 0 after update new listener endpoint to /rest/test22 for app test2', function test() {
		var listener =  {
			type : 'http',
			endpoint : '/rest/test22',
			flow : 'flow_2'
		};
		return request(control_server)
		  .put('/app/test2/listener/' + listener_id2)
		  .send({listener:listener})
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text, JSON.stringify({status:0}));
		  });
	  });
	  it('should return status 0 after calling deploy with action deployAll', function test() {
		var conf = {
			action : 'deployAll'
		};
		return request(control_server)
		  .post('/instance/' + instance_id + '/deploy')
		  .send({conf:conf})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.appResponse.status, 0);
			  assert.equal(json.appResponse.action, 'deployAll');
		  });
	  });
	  it('should return HTTP status 404 after request workflow from apps with endpoint /rest/test1', function test() {
		return request(app_server)
		  .get('/rest/test1')
		  .expect(404)
	  });
	  it('should return HTTP status 200 after request workflow from apps with endpoint /rest/test11', function test() {
		return request(app_server)
		  .get('/rest/test11')
		  .expect(200)
	  });
	  it('should return HTTP status 404 after request workflow from apps with endpoint /rest/test2', function test() {
		return request(app_server)
		  .get('/rest/test2')
		  .expect(404)
	  });
	  it('should return HTTP status 200 after request workflow from apps with endpoint /rest/test22', function test() {
		return request(app_server)
		  .get('/rest/test22')
		  .expect(200)
	  });
  });
  var listener_id3 = 0;
  describe('e2e test - manage routing 3rd apps - enable disable app', function() {
	  it('should return status 0 after create an app with name test3', function test() {
		return request(control_server)
		  .post('/app')
		  .send({name:'test3','description':'This is a test app'})
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text, JSON.stringify({status:0}));
		  });
	  });
	  
	  it('should return status 0 after create flow for app test3', function test() {
		var flows = {
			flow_3 : {
				steps: [
					{type:'log',log:'Hello world'},
					{type:'response',body:'This is the response printed from API 3'}
				]
			}
		};
		return request(control_server)
		  .post('/app/test3/flow')
		  .send({flows:flows})
		  .expect(200)
		  .expect(function(res) {
			  var expected = {status:0};
			  assert.equal(res.text, JSON.stringify(expected));
		  });
	  });
	  
	  it('should return status 0 after create new listener for app test3', function test() {
		var listener =  {
			type : 'http',
			endpoint : '/rest/test3',
			flow : 'flow_3'
		};
		return request(control_server)
		  .post('/app/test3/listener')
		  .send({listener:listener})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  
	  it('should return status 0 with one listener for app test3', function test() {
		return request(control_server)
		  .get('/app/test3/listener')
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.listeners.length, 1);
			  assert.equal(json.listeners[0].type, 'http');
			  assert.equal(json.listeners[0].endpoint, '/rest/test3');
			  assert.equal(json.listeners[0].flow, 'flow_3');
			  listener_id3 = json.listeners[0].id;
			  console.log('Temp check listener id: ' + listener_id3);
		  });
	  });
	  it('should return status 0 after assign one instance for app test3', function test() {
		return request(control_server)
		  .post('/app/test3/instance/' + instance_id)
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  it('should return status 0 after calling deploy with action deployAll', function test() {
		var conf = {
			action : 'deployAll'
		};
		return request(control_server)
		  .post('/instance/' + instance_id + '/deploy')
		  .send({conf:conf})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.appResponse.status, 0);
			  assert.equal(json.appResponse.action, 'deployAll');
		  });
	  });
	  it('should return HTTP status 404 after request workflow from apps with endpoint /rest/test3 as apps still disabled', function test() {
		return request(app_server)
		  .get('/rest/test3')
		  .expect(404)
	  });
	  it('should return status 0 after enable app for this instance', function test() {
		return request(control_server)
		  .post('/instance/' + instance_id + '/app/test3/enable')
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  it('should return status 0 after calling deploy with action deployAll', function test() {
		var conf = {
			action : 'deployAll'
		};
		return request(control_server)
		  .post('/instance/' + instance_id + '/deploy')
		  .send({conf:conf})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.appResponse.status, 0);
			  assert.equal(json.appResponse.action, 'deployAll');
		  });
	  });
	  it('should return HTTP status 200 after request workflow from apps with endpoint /rest/test3 as apps was enabled', function test() {
		return request(app_server)
		  .get('/rest/test3')
		  .expect(200)
	  });
	  it('should return status 0 after disable app for this instance', function test() {
		return request(control_server)
		  .post('/instance/' + instance_id + '/app/test3/disable')
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  it('should return status 0 after calling deploy with action deployAll', function test() {
		var conf = {
			action : 'deployAll'
		};
		return request(control_server)
		  .post('/instance/' + instance_id + '/deploy')
		  .send({conf:conf})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.appResponse.status, 0);
			  assert.equal(json.appResponse.action, 'deployAll');
		  });
	  });
	  it('should return HTTP status 404 after request workflow from apps with endpoint /rest/test3 as apps was disabled', function test() {
		return request(app_server)
		  .get('/rest/test3')
		  .expect(404)
	  });
	  
	  it('should return status 0 after update new listener endpoint to /rest/test33 for app test3', function test() {
		var listener =  {
			type : 'http',
			endpoint : '/rest/test33',
			flow : 'flow_3'
		};
		return request(control_server)
		  .put('/app/test3/listener/' + listener_id3)
		  .send({listener:listener})
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text, JSON.stringify({status:0}));
		  });
	  });
	  
	  it('should return status 0 after calling deploy with action deployAll', function test() {
		var conf = {
			action : 'deployAll'
		};
		return request(control_server)
		  .post('/instance/' + instance_id + '/deploy')
		  .send({conf:conf})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.appResponse.status, 0);
			  assert.equal(json.appResponse.action, 'deployAll');
		  });
	  });
	  it('should return HTTP status 404 after request workflow from apps with endpoint /rest/test33 as apps was disabled', function test() {
		return request(app_server)
		  .get('/rest/test33')
		  .expect(404)
	  });
	  it('should return HTTP status 404 after request workflow from apps with endpoint /rest/test3 as apps was disabled and it was changed', function test() {
		return request(app_server)
		  .get('/rest/test3')
		  .expect(404)
	  });
	  
	  it('should return status 0 after enable app for this instance', function test() {
		return request(control_server)
		  .post('/instance/' + instance_id + '/app/test3/enable')
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  
	  it('should return status 0 after calling deploy with action deployAll', function test() {
		var conf = {
			action : 'deployAll'
		};
		return request(control_server)
		  .post('/instance/' + instance_id + '/deploy')
		  .send({conf:conf})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.appResponse.status, 0);
			  assert.equal(json.appResponse.action, 'deployAll');
		  });
	  });
	  it('should return HTTP status 200 after request workflow from apps with endpoint /rest/test33 as apps was enabled', function test() {
		return request(app_server)
		  .get('/rest/test33')
		  .expect(200)
	  });
	  it('should return HTTP status 404 after request workflow from apps with endpoint /rest/test3 as apps was enabled but it was changed', function test() {
		return request(app_server)
		  .get('/rest/test3')
		  .expect(404)
	  });
  });
  
  describe('e2e test - updateOnly deployAppStatus', function() {
	  it('should return status 0 after disable app for this instance', function test() {
		return request(control_server)
		  .post('/instance/' + instance_id + '/app/test3/disable')
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  
	  it('should return status 0 after calling deploy with action deployAppStatus', function test() {
		var conf = {
			action : 'deployAppStatus',
			app : 'test3'
		};
		return request(control_server)
		  .post('/instance/' + instance_id + '/deploy')
		  .send({conf:conf})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.appResponse.status, 0);
			  assert.equal(json.appResponse.action, 'deployAppStatus');
		  });
	  });
	  it('should return HTTP status 404 after request workflow from apps with endpoint /rest/test33 as apps was disabled', function test() {
		return request(app_server)
		  .get('/rest/test33')
		  .expect(404)
	  });
	  
	  it('should return status 0 after enable app for this instance', function test() {
		return request(control_server)
		  .post('/instance/' + instance_id + '/app/test3/enable')
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  
	  it('should return status 0 after calling deploy with action deployAppStatus', function test() {
		var conf = {
			action : 'deployAppStatus',
			app : 'test3'
		};
		return request(control_server)
		  .post('/instance/' + instance_id + '/deploy')
		  .send({conf:conf})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.appResponse.status, 0);
			  assert.equal(json.appResponse.action, 'deployAppStatus');
		  });
	  });
	  it('should return HTTP status 200 after request workflow from apps with endpoint /rest/test33 as apps was disabled', function test() {
		return request(app_server)
		  .get('/rest/test33')
		  .expect(200)
	  });
  });
  describe('e2e test - updateOnly deployAppFlow', function() {
	  it('should return status 0 after update single flow definition for app test3', function test() {
		var flows = {
			flow_3 : {
				steps: [
					{type:'response',body:'This is the response printed from API 33'}
				]
			}
		};
		return request(control_server)
		  .put('/app/test3/flow/flow_3')
		  .send({flow:flows.flow_3})
		  .expect(200)
		  .expect(function(res) {
			  var expected = {status:0};
			  assert.equal(res.text, JSON.stringify(expected));
		  });
	  });
	  it('should return status 0 after calling deploy with action deployAppFlow', function test() {
		var conf = {
			action : 'deployAppFlow',
			app : 'test3',
			flow:'flow_3'
		};
		return request(control_server)
		  .post('/instance/' + instance_id + '/deploy')
		  .send({conf:conf})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.appResponse.status, 0);
			  assert.equal(json.appResponse.action, 'deployAppFlow');
		  });
	  });
	  it('should return status 0 after request workflow from apps with endpoint /rest/test33', function test() {
		return request(app_server)
		  .get('/rest/test33')
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text,"This is the response printed from API 33")
		  });
	  });
  });
  describe('e2e test - updateOnly deployAppFlows', function() {
	  it('should return status 0 after update single flow definition for app test3', function test() {
		var flows = {
			flow_3 : {
				steps: [
					{type:'response',body:'This is the response printed from API 333'}
				]
			}
		};
		return request(control_server)
		  .put('/app/test3/flow/flow_3')
		  .send({flow:flows.flow_3})
		  .expect(200)
		  .expect(function(res) {
			  var expected = {status:0};
			  assert.equal(res.text, JSON.stringify(expected));
		  });
	  });
	  it('should return status 0 after calling deploy with action deployAppFlows', function test() {
		var conf = {
			action : 'deployAppFlows',
			app : 'test3'
		};
		return request(control_server)
		  .post('/instance/' + instance_id + '/deploy')
		  .send({conf:conf})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.appResponse.status, 0);
			  assert.equal(json.appResponse.action, 'deployAppFlows');
		  });
	  });
	  it('should return status 0 after request workflow from apps with endpoint /rest/test33', function test() {
		return request(app_server)
		  .get('/rest/test33')
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text,"This is the response printed from API 333")
		  });
	  });
  });
  
  describe('e2e test - updateOnly deployApp', function() {
	  it('should return status 0 after update single flow definition for app test3', function test() {
		var flows = {
			flow_3 : {
				steps: [
					{type:'response',body:'This is the response printed from API 3333'}
				]
			}
		};
		return request(control_server)
		  .put('/app/test3/flow/flow_3')
		  .send({flow:flows.flow_3})
		  .expect(200)
		  .expect(function(res) {
			  var expected = {status:0};
			  assert.equal(res.text, JSON.stringify(expected));
		  });
	  });
	  it('should return status 0 after update new listener endpoint to /rest/test334 for app test3', function test() {
		var listener =  {
			type : 'http',
			endpoint : '/rest/test334',
			flow : 'flow_3'
		};
		return request(control_server)
		  .put('/app/test3/listener/' + listener_id3)
		  .send({listener:listener})
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text, JSON.stringify({status:0}));
		  });
	  });
	  it('should return status 0 after calling deploy with action deployApp', function test() {
		var conf = {
			action : 'deployApp',
			app : 'test3'
		};
		return request(control_server)
		  .post('/instance/' + instance_id + '/deploy')
		  .send({conf:conf})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.appResponse.status, 0);
			  assert.equal(json.appResponse.action, 'deployApp');
		  });
	  });
	  it('should return status HTTP 200 after request workflow from apps with endpoint /rest/test334', function test() {
		return request(app_server)
		  .get('/rest/test334')
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text,"This is the response printed from API 3333")
		  });
	  });
  });
  
  describe('e2e test - call workflows', function() {
	  it('should return status 0 after create an app with name test4', function test() {
		return request(control_server)
		  .post('/app')
		  .send({name:'test4','description':'This is a test app'})
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text, JSON.stringify({status:0}));
		  });
	  });
	  
	  it('should return status 0 after create flow for app test4', function test() {
		var flows = {
			main_flow : {
				steps : [
					{type:'request',action:'getParam',key:'firstName',var:'varFirst'},
					{type:'request',action:'getParam',key:'lastName',var:'varLast'},
					{type:'request',action:'getHeader',key:'auth',var:'varAuth'},
					{type:'request',action:'getPathParam',key:'id',var:'id'},
					{type:'calcFullName'},
					{type:'response',action:'setHeader',key:'myheader',value:'myHeaderValue'},
					{type:'response',body:'My fullname is ##fullName##. With my auth: {{varAuth}}. Id: ##id##'},
				]
			},
			post_flow : {
				steps : [
					{type:'request',action:'getBody',key:'firstName',var:'varFirst'},
					{type:'request',action:'getBody',key:'lastName',var:'varLast'},
					{type:'request',action:'getParam',key:'nickName',var:'varNickName'},
					{type:'request',action:'getHeader',key:'auth',var:'varAuth'},
					{type:'calcFullName'},
					{type:'response',action:'setHeader',key:'myheader',value:'myHeaderValue'},
					{type:'response',body:'My fullname is ##fullName##. Nickname: {{varNickName}}. With my auth: {{varAuth}}'},
				]
			},
			put_flow : {
				steps : [
					{type:'post_flow'},
				]
			},
			delete_flow : {
				steps : [
					{type:'post_flow'},
				]
			},
			call_http_flow : {
				steps : [
					{type:'http','url':'http://localhost:8081/rest/calcFullName?firstName=mary&lastName=brown',var:'respBody'},
					{type:'response',body:'My fullname is ##respBody##'},
				]
			},
			calcFullName_flow: {
				steps : [
					{type:'request',action:'getParam',key:'firstName',var:'varFirst'},
					{type:'request',action:'getParam',key:'lastName',var:'varLast'},
					{type:'calcFullName'},
					{type:'response',body:'{{fullName}}'},
				]
			},
			calcFullName: {
				steps : [
					{type:'setVar',name:'fullName',value:'{{varFirst}} {{varLast}}'},
				]
			},
			call_http_header_flow : {
				steps : [
					{type:'http','url':'http://localhost:8081/rest/calcHeaders?firstName=mary&lastName=brown',
						varResponse:'resp',
						headers : '{"headera":"headers"}',
						params : 'paramA=a&paramB=b'
					},
					{type:'setVar',name:'respBody',value:'{{resp.body}}'},
					{type:'response',body:'My fullname is ##respBody## {{resp.headers.headerb}}'},
				]
			},
			calcHeaders_flow : {
				steps : [
					{type:'request',action:'getParam',key:'firstName',var:'varFirst'},
					{type:'request',action:'getParam',key:'lastName',var:'varLast'},
					{type:'request',action:'getBody',key:'paramA',var:'paramA'},
					{type:'request',action:'getBody',key:'paramB',var:'paramB'},
					{type:'request',action:'getHeader',key:'headera',var:'headera'},
					{type:'response',action:'setHeader',key:'headerb',value:'headerb'},
					{type:'response',body:'{{varFirst}} {{varLast}} {{paramA}} {{paramB}} {{headera}}'},
				]
			}
		};
		return request(control_server)
		  .post('/app/test4/flow')
		  .send({flows:flows})
		  .expect(200)
		  .expect(function(res) {
			  var expected = {status:0};
			  assert.equal(res.text, JSON.stringify(expected));
		  });
	  });
	  
	  it('should return status 0 after create new listener /rest/main for app test4', function test() {
		var listener =  {
			type : 'http',
			endpoint : '/rest/main/:id',
			flow : 'main_flow'
		};
		return request(control_server)
		  .post('/app/test4/listener')
		  .send({listener:listener})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  it('should return status 0 after create new listener /rest/post for app test4', function test() {
		var listener =  {
			type : 'http',
			endpoint : '/rest/post',
			flow : 'post_flow',
			method : 'POST'
		};
		return request(control_server)
		  .post('/app/test4/listener')
		  .send({listener:listener})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  it('should return status 0 after create new listener /rest/put for app test4', function test() {
		var listener =  {
			type : 'http',
			endpoint : '/rest/put',
			flow : 'put_flow',
			method : 'PUT'
		};
		return request(control_server)
		  .post('/app/test4/listener')
		  .send({listener:listener})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  it('should return status 0 after create new listener /rest/delete for app test4', function test() {
		var listener =  {
			type : 'http',
			endpoint : '/rest/delete',
			flow : 'delete_flow',
			method : 'DELETE'
		};
		return request(control_server)
		  .post('/app/test4/listener')
		  .send({listener:listener})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  it('should return status 0 after create new listener /rest/callhttp for app test4', function test() {
		var listener =  {
			type : 'http',
			endpoint : '/rest/callhttp',
			flow : 'call_http_flow'
		};
		return request(control_server)
		  .post('/app/test4/listener')
		  .send({listener:listener})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  it('should return status 0 after create new listener /rest/calcFullName for app test4', function test() {
		var listener =  {
			type : 'http',
			endpoint : '/rest/calcFullName',
			flow : 'calcFullName_flow'
		};
		return request(control_server)
		  .post('/app/test4/listener')
		  .send({listener:listener})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  it('should return status 0 after create new listener /rest/call_http_header_flow for app test4', function test() {
		var listener =  {
			type : 'http',
			endpoint : '/rest/call_http_header_flow',
			flow : 'call_http_header_flow'
		};
		return request(control_server)
		  .post('/app/test4/listener')
		  .send({listener:listener})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  it('should return status 0 after create new listener /rest/calcHeaders for app test4', function test() {
		var listener =  {
			type : 'http',
			endpoint : '/rest/calcHeaders',
			flow : 'calcHeaders_flow'
		};
		return request(control_server)
		  .post('/app/test4/listener')
		  .send({listener:listener})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  it('should return status 0 after assign one instance for app test4', function test() {
		return request(control_server)
		  .post('/app/test4/instance/' + instance_id)
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  
	  it('should return status 0 after enable app for this instance', function test() {
		return request(control_server)
		  .post('/instance/' + instance_id + '/app/test4/enable')
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  it('should return status 0 after calling deploy with action deployAll', function test() {
		var conf = {
			action : 'deployAll'
		};
		return request(control_server)
		  .post('/instance/' + instance_id + '/deploy')
		  .send({conf:conf})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.appResponse.status, 0);
			  assert.equal(json.appResponse.action, 'deployAll');
		  });
	  });
	  
	  it('should return OK for calling workflows with GET', function test() {
		return request(app_server)
		  .get('/rest/main/3?firstName=mary&lastName=brown')
		  .set('auth','myauth')
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text, "My fullname is mary brown. With my auth: myauth. Id: 3")
			  assert.equal(res.headers.myheader, 'myHeaderValue')
		  });
	  });
	  
	  it('should return OK for calling workflows with POST', function test() {
		return request(app_server)
		  .post('/rest/post?nickName=Kate')
		  .send({firstName:'mary',lastName:'brown'})
		  .set('auth','myauth')
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text, "My fullname is mary brown. Nickname: Kate. With my auth: myauth")
			  assert.equal(res.headers.myheader, 'myHeaderValue')
		  });
	  });
	  
	  it('should return OK for calling workflows with PUT', function test() {
		return request(app_server)
		  .put('/rest/put?nickName=Kate')
		  .send({firstName:'mary',lastName:'brown'})
		  .set('auth','myauth')
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text, "My fullname is mary brown. Nickname: Kate. With my auth: myauth")
			  assert.equal(res.headers.myheader, 'myHeaderValue')
		  });
	  });
	  
	  it('should return OK for calling workflows with DELETE', function test() {
		return request(app_server)
		  .delete('/rest/delete?nickName=Kate')
		  .send({firstName:'mary',lastName:'brown'})
		  .set('auth','myauth')
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text, "My fullname is mary brown. Nickname: Kate. With my auth: myauth")
			  assert.equal(res.headers.myheader, 'myHeaderValue')
		  });
	  });
	  
	  it('should return OK for calling workflows with /rest/callhttp', function test() {
		return request(app_server)
		  .get('/rest/callhttp?firstName=mary&lastName=brown')
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text, "My fullname is mary brown")
		  });
	  });
	  it('should return OK for calling workflows with /rest/call_http_header_flow', function test() {
		return request(app_server)
		  .get('/rest/call_http_header_flow')
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text, "My fullname is mary brown a b headers headerb")
		  });
	  });
  });
  
  describe('e2e test - delete 3rd apps and deployAll again and should not crash', function() {
	  it('should return status 0 after delete app test3', function test() {
		return request(control_server)
		  .delete('/app/test3')
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text, JSON.stringify({status:0}));
		  });
	  });
	  
	  it('should return status 0 after calling deploy with action deployAll', function test() {
		var conf = {
			action : 'deployAll'
		};
		return request(control_server)
		  .post('/instance/' + instance_id + '/deploy')
		  .send({conf:conf})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.appResponse.status, 0);
			  assert.equal(json.appResponse.action, 'deployAll');
		  });
	  });
  });
  
  describe('e2e test - backup & restore', function() {
	  var backupedJson = null;
	  it('should able to backup', function test() {
		return request(control_server)
		  .get('/backup/export')
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.appData.length, 3);
			  backupedJson = json;
		  });
	  });
	  
	  it('should be OK to call the apps after perform backup', function test() {
		return request(app_server)
		  .post('/rest/post?nickName=Kate')
		  .send({firstName:'mary',lastName:'brown'})
		  .set('auth','myauth')
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text, "My fullname is mary brown. Nickname: Kate. With my auth: myauth")
			  assert.equal(res.headers.myheader, 'myHeaderValue')
		  });
	  });
	  
	  it('should return status 0 after delete app test4', function test() {
		return request(control_server)
		  .delete('/app/test4')
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text, JSON.stringify({status:0}));
		  });
	  });
	  
	  it('should return status 0 after calling deploy with action deployAll', function test() {
		var conf = {
			action : 'deployAll'
		};
		return request(control_server)
		  .post('/instance/' + instance_id + '/deploy')
		  .send({conf:conf})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.appResponse.status, 0);
			  assert.equal(json.appResponse.action, 'deployAll');
		  });
	  });
	  
	  it('should be not OK to call the apps after perform destroy', function test() {
		return request(app_server)
		  .post('/rest/post?nickName=Kate')
		  .send({firstName:'mary',lastName:'brown'})
		  .set('auth','myauth')
		  .expect(404);
	  });
	  
	  it('should able to restore original json from backup', function test() {
		return request(control_server)
		  .post('/backup/import')
		  .send({input:JSON.stringify(backupedJson)})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  it('should be not OK to call the apps after restore but without redeploy yet', function test() {
		return request(app_server)
		  .post('/rest/post?nickName=Kate')
		  .send({firstName:'mary',lastName:'brown'})
		  .set('auth','myauth')
		  .expect(404);
	  });
	  it('should return status 0 after calling deploy with action deployAll', function test() {
		var conf = {
			action : 'deployAll'
		};
		return request(control_server)
		  .post('/instance/' + instance_id + '/deploy')
		  .send({conf:conf})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.appResponse.status, 0);
			  assert.equal(json.appResponse.action, 'deployAll');
		  });
	  });
	  
	  it('should be OK to call the apps after perform restore', function test() {
		return request(app_server)
		  .post('/rest/post?nickName=Kate')
		  .send({firstName:'mary',lastName:'brown'})
		  .set('auth','myauth')
		  .expect(200)
		  .expect(function(res) {
			  assert.equal(res.text, "My fullname is mary brown. Nickname: Kate. With my auth: myauth")
			  assert.equal(res.headers.myheader, 'myHeaderValue')
		  });
	  });
  });
  
  describe('e2e test - create listener for deploy init', function() {
	  var backupedJson = null;
	  it('should able to backup', function test() {
		return request(control_server)
		  .get('/backup/export')
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.appData.length, 3);
			  backupedJson = json;
		  });
	  });
	  it('should return status 0 after create new listener type app_init for app test', function test() {
		var listener =  {
			type : 'app_init',
			flow : 'flow_app_init'
		};
		return request(control_server)
		  .post('/app/test/listener')
		  .send({listener:listener})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
		  });
	  });
	  var listener_id = 0;
	  it('should return status 0 with one listener type app_init for app test', function test() {
		return request(control_server)
		  .get('/app/test/listener')
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.listeners.length, 2);
			  assert.equal(json.listeners[1].type, 'app_init');
			  assert.equal(json.listeners[1].flow, 'flow_app_init');
			  listener_id = json.listeners[1].id;
			  console.log('Temp check listener id: ' + listener_id);
		  });
	  });
	  it('should return status 0 after calling deploy with action deployAll', function test() {
		var conf = {
			action : 'deployAll'
		};
		return request(control_server)
		  .post('/instance/' + instance_id + '/deploy')
		  .send({conf:conf})
		  .expect(200)
		  .expect(function(res) {
			  var json = JSON.parse(res.text);
			  assert.equal(json.status, 0);
			  assert.equal(json.appResponse.status, 0);
			  assert.equal(json.appResponse.action, 'deployAll');
		  });
	  });
  });
}); 