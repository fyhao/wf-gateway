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
