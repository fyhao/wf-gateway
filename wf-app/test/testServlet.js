var assert = require('assert');
var modServlet = require('../lib/module/engine/modServlet');
var eventMgr = {};
describe('modServlet module', function () {
	var executeTestCase = function(opts) {
	  var appItem = {
			app:'test',
			flows:opts.flows
		}
		var appLi = { flow: opts.entryFlow};
		var req = {
			params : opts.requestParams,
			headers : opts.requestHeaders,
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
  describe('#setVar', function() {
	  it('should be OK to setVar and response the variable in ##xxx## (string)', function test(done) {
		  executeTestCase({
			  flows:{
				flow_1: {
					steps : [
						{type:'setVar',name:'name',value:'ali'},
						{type:'response',body:'the response name is ##name##'},
					]
				}
			  },
			  entryFlow:'flow_1',
			  done:done,
			  resEnd : function(body) {
				  assert.equal(body,"the response name is ali")
			  }
		  });
	  });
	  it('should be OK to setVar and response the variable in ##xxx## (integer)', function test(done) {
		  executeTestCase({
			  flows:{
				flow_1: {
					steps : [
						{type:'setVar',name:'id',value:123},
						{type:'response',body:'the response id is ##id##'},
					]
				}
			  },
			  entryFlow:'flow_1',
			  done:done,
			  resEnd : function(body) {
				  assert.equal(body,"the response id is 123")
			  }
		  });
	  });
  });
  
  describe('#request', function() {
	  it('should be OK to get request param in hash and eval', function test(done) {
		  executeTestCase({
			  flows:{
				flow_1: {
					steps : [
						{type:'request',action:'getParam',key:'firstName',var:'varFirst'},
						{type:'request',action:'getParam',key:'lastName',var:'varLast'},
						{type:'setVar',name:'fullName',value:'{{varFirst}} {{varLast}}'},
						{type:'response',body:'My fullname is ##fullName##'},
					]
				}
			  },
			  entryFlow:'flow_1',
			  requestParams : {firstName:'mary',lastName:'brown'},
			  done:done,
			  resEnd : function(body) {
				  assert.equal(body,"My fullname is mary brown")
			  }
		  });
	  });
	  it('should be OK to get request header', function test(done) {
		  executeTestCase({
			  flows:{
				flow_1: {
					steps : [
						{type:'request',action:'getHeader',key:'auth',var:'varAuth'},
						{type:'request',action:'getHeader',key:'user-agent',var:'userAgent'},
						{type:'response',body:'the header is ##varAuth##, ##userAgent##'},
					]
				}
			  },
			  entryFlow:'flow_1',
			  done:done,
			  requestHeaders : {auth:'authvalue','user-agent':'mozilla'},
			  resEnd : function(body) {
				  assert.equal(body,"the header is authvalue, mozilla")
			  }
		  });
	  });
  });	

	describe('#subflow', function() {
	  it('should be OK to call subflow', function test(done) {
		  executeTestCase({
			  flows:{
				flow_1: {
					steps : [
						{type:'request',action:'getParam',key:'firstName',var:'varFirst'},
						{type:'request',action:'getParam',key:'lastName',var:'varLast'},
						{type:'calcFullName'},
						{type:'response',body:'My fullname is ##fullName##'},
					]
				},
				calcFullName: {
					steps : [
						{type:'setVar',name:'fullName',value:'{{varFirst + " " + varLast}}'},
					]
				}
			  },
			  entryFlow:'flow_1',
			  requestParams : {firstName:'mary',lastName:'brown'},
			  done:done,
			  resEnd : function(body) {
				  assert.equal(body,"My fullname is mary brown")
			  }
		  });
	  });
	});
});
