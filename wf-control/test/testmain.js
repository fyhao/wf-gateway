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
  it('initial list', function test() {
    return request(server)
      .get('/app')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify([]))
	  });
  });
  it('get single item by name before create, should return error status', function test() {
    return request(server)
      .get('/app/test')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:100}));
	  });
  });
  it('create new item, should return status 0', function test() {
    return request(server)
      .post('/app')
	  .send({name:'test','description':'This is a test app'})
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:0}));
	  });
  });
  it('get list after create item, should return list of items added', function test() {
    return request(server)
      .get('/app')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify([{name:'test','description':'This is a test app'}]))
	  });
  });
  it('get single item by valid name, should return valid result', function test() {
    return request(server)
      .get('/app/test')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({name:'test','description':'This is a test app'}));
	  });
  });
  it('get single item by invalid name, should return invalid result', function test() {
    return request(server)
      .get('/app/test1')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:100}));
	  });
  });
  it('update app', function test() {
    return request(server)
      .put('/app/test')
	  .send({'fields': {'description':'Changed desc'}})
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:0}));
	  });
  });
  it('get single item by valid name after update', function test() {
    return request(server)
      .get('/app/test')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({name:'test','description':'Changed desc'}));
	  });
  });
});