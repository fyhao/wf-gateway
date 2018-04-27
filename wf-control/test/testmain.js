var assert = require('assert');
//var util = ProjRequire('./lib/util.js');
describe('main.js', function() {
  this.timeout(15000);
  
  describe('first_test', function() {
    it('first_test', function() {
		assert.equal("test","test");
    });
  });
});