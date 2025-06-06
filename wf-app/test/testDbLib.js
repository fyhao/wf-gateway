var assert = require('assert');
var dbLib = require('../lib/dbLib.js');

describe('dbLib oracle support', function() {
  it('should execute query and populate variables', function(done) {
    var executed = false;
    var fakeConnection = {
      execute: function(sql, binds, opts, cb) {
        executed = true;
        cb(null, { rows: [{ VAL: 1 }] });
      },
      close: function(cb) { cb(); }
    };
    var fakeOracle = {
      OUT_FORMAT_OBJECT: {},
      getConnection: function(cfg, cb) { cb(null, fakeConnection); }
    };
    dbLib._setOracle(fakeOracle);
    var ctx = { vars: {} };
    dbLib.query({
      ctx: ctx,
      cfg: { type: 'oracle' },
      sql: 'select 1 as VAL from dual',
      recordsets: ['VAL'],
      checkNext: function() {
        assert.ok(executed);
        assert.deepEqual(ctx.results, [{ VAL: 1 }]);
        assert.equal(ctx.vars.VAL, 1);
        dbLib._setOracle(null);
        done();
      }
    });
  });
});
