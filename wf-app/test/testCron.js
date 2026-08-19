var assert = require('assert');
var cronManager = require('../lib/cronManager');

describe('cron manager', function() {
	afterEach(function() { cronManager.clearJobs(); });
	it('registers a valid enabled cron listener and invokes its flow', function(done) {
		var calls = 0;
		cronManager.register([{ status: 'enabled', listeners: [{ type: 'cron', expression: '*/1 * * * * *', flow: 'scheduled' }] }], function(app, listener) {
			calls++;
			assert.equal(app.status, 'enabled');
			assert.equal(listener.flow, 'scheduled');
		});
		setTimeout(function() { assert.ok(calls > 0); done(); }, 1200);
	});
	it('does not register disabled or invalid listeners', function() {
		cronManager.register([{ status: 'disabled', listeners: [{ type: 'cron', expression: '*/1 * * * * *' }] }, { status: 'enabled', listeners: [{ type: 'cron', expression: 'invalid' }] }], function() {});
		assert.equal(cronManager._getJobs().length, 0);
	});
	it('recognises five- and six-field cron expressions', function() {
		assert.ok(cronManager._matches('*/1 * * * * *', new Date()));
		assert.ok(cronManager._matches('* * * * *', new Date()));
		assert.equal(cronManager._matches('invalid', new Date()), false);
	});
});
