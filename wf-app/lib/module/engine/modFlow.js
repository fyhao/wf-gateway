var util = ProjRequire('lib/MyUtil');
var modStep = require('./modStep.js');
var evalParser = require('./helperEvalParser.js');
var propParser = require('./helperPropParser.js');
FLOW_ENGINE_CANCELED = false;
var FlowEngine = function(flow) {
	var _FLOW_ENGINE_CANCELED = false;
	var vars = {};
	var wv = null;
	this.setWv = function(v) {
		wv = v;
		return this;
	}
	var item = null;
	this.setItem = function(v) {
		item = v;
		return this;
	}
	var ctx = {};
	
	function enable_FLOW_ENGINE_CANCELLED() {
		_FLOW_ENGINE_CANCELED = true;
		console.log('enable_FLOW_ENGINE_CANCELLED called');
	}
	this.setContext = function(v) {
		ctx = v;
		wv = ctx.wv;
		item = ctx.item;
		ctx.FLOW_ENGINE_CANCELED_notification_queues.push(enable_FLOW_ENGINE_CANCELLED);
		return this;
	}
	this.setInputVars = function(_vars) {
		var v = util.clone(_vars);
		delete v.type;
		for(var i in v) {
			vars[i] = v[i];
		}
		return this;
	}
	this.flow = util.clone(flow);
	this.canceled = false;
	
	this.execute = function(done) {
		var steps = this.flow.steps;
		if(steps && steps.length) {
			var curStep = -1;
			var checkNext = function() {
				curStep++;
				if(curStep < steps.length) {
					processStep(steps[curStep], checkNext);
				}
				else {
					if(done.length == 1) {
						process.nextTick(function() {
							var outputVars = {};
							for(var i in ctx.vars) {
								outputVars[i] = ctx.vars[i];
							}
							done(outputVars);
						});
					}
					else {
						process.nextTick(done);
					}
				}
			}
			process.nextTick(checkNext);
		}
		else {
			process.nextTick(done);
		}
	}
	this.cancel = function() {
		this.canceled = true;
	}
	var replaceVars = function(c) {
		for(var k in vars) {
			c = util.replaceAll(c, '##' + k + '##', vars[k]);
		}
		for(var k in ctx.vars) {
			c = util.replaceAll(c, '##' + k + '##', ctx.vars[k]);
		}
		var __vars = {};
		for(var k in vars) {
			__vars[k] = vars[k];
		}
		for(var k in ctx.vars) {
			__vars[k] = ctx.vars[k];
		}
		var parser = new evalParser();
		c = parser.parse(c, __vars);
		c = propParser.parse(ctx,c);
		return c;
	}
	var replaceVarsStep = function(step) {
		for(var i in step) {
			if(typeof step[i] != 'string') {
				step[i] = replaceVarsStep(step[i]);
			}
			else {
				step[i] = replaceVars(step[i]);
			}
		}
		return step;
	}
	var processStep = function(step, next) {
		//console.log('processStep _FLOW_ENGINE_CANCELED ' + _FLOW_ENGINE_CANCELED);
		//console.log(JSON.stringify(step)); 
		//console.log(JSON.stringify(ctx._vars));
		if(_FLOW_ENGINE_CANCELED) {
			return;
		}
		step = replaceVarsStep(step);
		//console.log(JSON.stringify(step)); 
		// search ctx.flows if any
		if(typeof ctx.flows != 'undefined') {
			var flow = ctx.flows[step.type];
			//console.log('search flow ' + step.type + " = " + (typeof flow));
			if(typeof flow != 'undefined') {
				new FlowEngine(flow).setContext(ctx).setInputVars(step).execute(function() {
					process.nextTick(next);
				});
				return;
			}
		}
		// search step modules if any
		ctx._vars = vars; // get local vars
		modStep.processStep(ctx, step, next);
		vars = ctx._vars; // set local vars
	}
}

module.exports.FlowEngine = FlowEngine;
module.exports.FLOW_ENGINE_CANCELED = FLOW_ENGINE_CANCELED;