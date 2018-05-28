var assert = require('assert');
var modServlet = require('../lib/module/engine/modServlet');
var eventMgr = {};
describe('modServlet module', function () {
  describe('createHandler', function() {
	  it('should be able to get response for simple handler', function test(done) {
		var appItem = {
			app:'test',
			flows:{
				flow_1: {
					steps : [
						{type:'log',message:'test'},
						{type:'response',body:'test'},
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
				assert.equal(body, "test")
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
	  var executeTestCase = function(opts) {
		  var appItem = {
				app:'test',
				flows:opts.flows
			}
			var appLi = { flow: opts.entryFlow};
			var req = {
				params : opts.requestParams,
				param : function(name) {
					return this.params[name]
				}
			};
			var res = {
				end : opts.resEnd
			}
			eventMgr.trigger = function(name, opts1) {
				if(name == 'flowExecutedDone') {
					var ctx = opts1.ctx;
					opts.done();
				}
			}
			modServlet._injectUnitTest({apps:[appItem]});
			var handler = modServlet.createHandler(eventMgr, appItem, appLi);
			handler(req, res);
	  }
	  it('should be OK for executeTestCase function structure', function test(done) {
		  executeTestCase({
			  flows:{
				flow_1: {
					steps : [
						{type:'log',message:'test'},
						{type:'response',body:'test'},
					]
				}
			  },
			  entryFlow:'flow_1',
			  requestParams : {name:'ali',age:20},
			  done:done,
			  resEnd : function(body) {
				  assert.equal(body,"test")
			  }
		  });
	  });
  });
  
});