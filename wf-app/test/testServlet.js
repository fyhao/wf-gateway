var assert = require('assert');
var modServlet = require('../lib/module/engine/modServlet');
var eventMgr = {};
describe('modServlet module', function () {
  describe('createHandler', function() {
	  it('should return status 0 when deploy with json conf', function test(done) {
		var appItem = {
			app:'test',
			flows:{
				flow_1: {
					steps : [
						{type:'log',message:'test'},
					]
				}
			}
		}
		var appLi = { flow: 'flow_1'};
		var req = {
			param : function(name) {
				return name;
			}
		};
		var res = {
			end : function(body) {
				
			}
		}
		eventMgr.trigger = function(name, opts) {
			if(name == 'flowExecutedDone') {
				var ctx = opts.ctx;
				done();
			}
		}
		modServlet._injectUnitTest({apps:[appItem]});
		var handler = modServlet.createHandler(eventMgr, appItem, appLi);
		handler(req, res);
		
	  });
  });
  
});
