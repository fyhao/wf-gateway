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
      .get('/app/list')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify([]))
	  });
  });
  it('create new item', function test() {
    return request(server)
      .get('/app/create?name=test')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify({status:0}));
	  });
  });
  it('get list after create item', function test() {
    return request(server)
      .get('/app/list')
      .expect(200)
	  .expect(function(res) {
		  assert.equal(res.text, JSON.stringify([{name:'test'}]))
	  });
  });
});