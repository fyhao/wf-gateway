var assert = require('assert');
var request = require('supertest');
var cronManager = require('../lib/cronManager');

describe('cron listener', function() {
  var server;
  before(function () {
    global.testCounter = 0;
    server = require('../server', { bustCache: true })();
  });
  after(function (done) {
    cronManager.clearJobs();
    server.close(done);
  });
  it('should execute flow via cron', function (done) {
    var conf = {
      action: 'deployAll',
      apps: [{
        app: 'cronApp',
        status: 'enabled',
        flows: {
          flow_1: {
            steps: [
              { type: 'evaljs', code: 'global.testCounter = (global.testCounter||0)+1' }
            ]
          }
        },
        listeners: [
          { type: 'cron', expression: '*/1 * * * * *', flow: 'flow_1' }
        ]
      }]
    };
    request(server)
      .post('/control/deploy')
      .send({ conf: conf })
      .expect(200)
      .end(function(err) {
        if (err) return done(err);
        setTimeout(function () {
          try {
            assert.ok(global.testCounter >= 1);
            done();
          } catch (e) {
            done(e);
          }
        }, 1500);
      });
  });
});
