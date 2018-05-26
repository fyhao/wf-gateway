var assert = require('assert');

var request = require('supertest');
describe('loading express', function () {
  var control_server;
  var app_server;
  beforeEach(function () {
    control_server = require('../../wf-control/server', { bustCache: true })();
	app_server = require('../../wf-app/server', { bustCache: true })();
  });
  afterEach(function (done) {
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
		}
	};
    return request(control_server)
      .post('/app/test/flow')
	  .send({app:'test',flows:flows})
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
}); 