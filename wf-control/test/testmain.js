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
});