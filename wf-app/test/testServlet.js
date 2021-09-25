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
			query : opts.requestParams,
			params : opts.requestPathParams,
			headers : opts.requestHeaders,
			body : opts.requestBodys
		};
		var res = {
			end : opts.resEnd,
			set : function(key,value) {
				this.headers[key] = value;
			},
			get : function(key) {
				return this.headers[key];
			},
			headers : {}
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
			query : {}
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
		
	  }); // end it
	  
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
	  }); // end it
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
	  }); // end it
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
	  }); // end it
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
	  }); // end it
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
	  }); // end it
	  it('should be OK to get request body', function test(done) {
		  executeTestCase({
			  flows:{
				flow_1: {
					steps : [
						{type:'request',action:'getBody',key:'myBody',var:'body'},
						{type:'response',body:'the body is ##body##'},
					]
				}
			  },
			  entryFlow:'flow_1',
			  done:done,
			  requestBodys : {myBody:'bodyValue'},
			  resEnd : function(body) {
				  assert.equal(body,"the body is bodyValue")
			  }
		  });
	  }); // end it
	  it('should be OK to get request body', function test(done) {
		  executeTestCase({
			  flows:{
				flow_1: {
					steps : [
						{type:'request',action:'getPathParam',key:'id',var:'id'},
						{type:'response',body:'the id is ##id##'},
					]
				}
			  },
			  entryFlow:'flow_1',
			  done:done,
			  requestPathParams : {id:'3'},
			  resEnd : function(body) {
				  assert.equal(body,"the id is 3")
			  }
		  });
	  }); // end it
  });	
  
  describe('#response', function() {
	  it('should be OK to set response body', function test(done) {
		  executeTestCase({
			  flows:{
				flow_1: {
					steps : [
						{type:'response',body:'My fullname'},
					]
				}
			  },
			  entryFlow:'flow_1',
			  done:done,
			  resEnd : function(body) {
				  assert.equal(body,"My fullname")
			  }
		  });
	  }); // end it
	  
	  it('should be OK to set response header', function test(done) {
		  executeTestCase({
			  flows:{
				flow_1: {
					steps : [
						{type:'response',action:'setHeader',key:'statusCode',value:'404'},
						{type:'response',action:'getHeader',key:'statusCode',var:'varCode'},
						{type:'response',body:'the code is ##varCode##'},
						
					]
				}
			  },
			  entryFlow:'flow_1',
			  done:done,
			  resEnd : function(body) {
				  assert.equal(body,"the code is 404")
			  }
		  });
	  }); // end it
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
	  }); // end it
	});
	
	describe('#evaljs', function() {
	  it('should be OK to call evaljs and assign result to var', function test(done) {
		  executeTestCase({
			  flows:{
				flow_1: {
					steps : [
						{type:'evaljs',code:'"mary" + " " + "brown"',var:'fullName'},
						{type:'response',body:'My fullname is ##fullName##'},
					]
				}
			  },
			  entryFlow:'flow_1',
			  done:done,
			  resEnd : function(body) {
				  assert.equal(body,"My fullname is mary brown")
			  }
		  });
	  }); // end it
	}); // describe
	
	describe('#wait #asyncFlow', function() {
	  it('should be OK to call wait and asyncFlow', function test(done) {
		  executeTestCase({
			  flows:{
				flow_1: {
					steps : [
						{type:'asyncFlow',flow:'subflow'},
						{type:'wait',timeout:5},
						{type:'response',body:'My fullname ##result##'},
					]
				},
				subflow: {
					steps : [
						{type:'setVar',name:'result',value:'1'}
					]
				}
			  },
			  entryFlow:'flow_1',
			  done:done,
			  resEnd : function(body) {
				  assert.equal(body,"My fullname 1")
			  }
		  });
	  }); // end it
	}); // describe
	
	describe('#parallel', function() {
	  it('should be OK to call parallel', function test(done) {
		  executeTestCase({
			  flows:{
				flow_1: {
					steps : [
						{type:'setVar',name:'result',value:'1'},
						{type:'setVar',name:'task_1_flag',value:'0'},
						{type:'setVar',name:'task_2_flag',value:'0'},
						{type:'parallel',flows:['task_1','task_2'],timeout:10},
						{type:'setVar',name:'result',value:'4'},
						{type:'response',body:'result ##result## task_1_flag ##task_1_flag## task_2_flag ##task_2_flag##'},
					]
				},
				task_1 : {
					steps : [
						{type:'setVar',name:'result',value:'2'},
						{type:'setVar',name:'task_1_flag',value:'1'}
					]
				},
				task_2 : {
					steps : [
						{type:'setVar',name:'result',value:'3'},
						{type:'setVar',name:'task_2_flag',value:'2'}
					]
				}
			  },
			  entryFlow:'flow_1',
			  done:done,
			  resEnd : function(body) {
				  assert.equal(body,"result 4 task_1_flag 1 task_2_flag 2")
			  }
		  });
	  }); // end it
	}); // describe
	
	describe('#onException', function() {
	  it('should be OK to call onException with flow name', function test(done) {
		  executeTestCase({
			  flows:{
				flow_1: {
					steps : [
						{type:'setVar',name:'a',value:'{{throw e}}'},
						{type:'response',body:'OK'},
					],
					onException : 'exceptionFlow'
				},
				'exceptionFlow' : {
					steps : [
						{type:'setVar',name:'a',value:'{{throw e}}'},
						{type:'response',body:'Exception'},
					],
					onException : 'generalException'
				},
				'generalException' : {
					steps : [
						{type:'response',body:'Exception General'},
					],
				},
			  },
			  entryFlow:'flow_1',
			  done:done,
			  resEnd : function(body) {
				  assert.equal(body,"Exception General")
			  }
		  });
	  }); // end it
	}); // onException
	
	describe('#http', function() {
	  it('should be OK to call http', function test(done) {
		  executeTestCase({
			  flows:{
				flow_1: {
					steps : [
						{type:'setVar',name:'a',value:'a'},
						{type:'http',method:'GET',url:'https://api.com/api/1',headers:{'x-api':'1.0'},'var':'resultvar',mockfrequest:function(frequestobj) {
							var apiver = frequestobj.headers['x-api'];
							var method = frequestobj.method;
							frequestobj.callback('resp ' + apiver + ' ' + method);
						}},
						{type:'response',body:'OK {{resultvar}}'},
					]
				}
			  },
			  entryFlow:'flow_1',
			  done:done,
			  resEnd : function(body) {
				  assert.equal(body,"OK resp 1.0 GET")
			  }
		  });
	  }); // end it
	  it('should be OK to call http for request headers string reference variable', function test(done) {
		  executeTestCase({
			  flows:{
				flow_1: {
					steps : [
						{type:'setVar',name:'myheaders',value:{'x-api':'1.0'}},
						{type:'http',method:'GET',url:'https://api.com/api/1',headers:'myheaders','var':'resultvar',mockfrequest:function(frequestobj) {
							var apiver = frequestobj.headers['x-api'];
							var method = frequestobj.method;
							frequestobj.callback('resp ' + apiver + ' ' + method);
						}},
						{type:'response',body:'OK {{resultvar}}'},
					]
				}
			  },
			  entryFlow:'flow_1',
			  done:done,
			  resEnd : function(body) {
				  assert.equal(body,"OK resp 1.0 GET")
			  }
		  });
	  }); // end it
	}); // http
});
