var modFlow = require('./modFlow');
global.STEP_TIMEOUT = 0;

var createHandler = function(appItem, appLi) {
	return function(req, res) {
		// get all flows definition and execute
		//appItem.flows
		//appLi.flow (string)
				
		var ctx = createContext(appItem.flows, req, res);
		ctx.createFlowEngine(appLi.flow).execute(function() {});
	}
}

var createContext = function(flows, req, res) {
	var ctx = {}; // context object
	ctx.req = req;
	ctx.res = res;
	ctx.flows = flows;
	ctx.vars = {};
	ctx._logs = [];
	ctx.props = {};
	ctx.FLOW_ENGINE_CANCELED_notification_queues = [];
	
	ctx.enable_FLOW_ENGINE_CANCELLED = function() {
		var queues = ctx.FLOW_ENGINE_CANCELED_notification_queues;
		if(queues && queues.length) {
			for(var i = 0; i < queues.length; i++) {
				queues[i]();
			}
		}
	}
	ctx.createFlowEngine = function(flow) {
		if(typeof flow != 'undefined') {
			if(typeof flow == 'object') {
				// flow object
				return new modFlow.FlowEngine(flow).setContext(ctx);
			}
			else if(typeof flow == 'string') {
				// flow name
				if(typeof ctx.flows[flow] != 'undefined') {
					return new modFlow.FlowEngine(ctx.flows[flow]).setContext(ctx);
				}
			}
		}
		// return dummy function for silent execution
		return {
			execute : function(next) {
				if(next.length == 1) {
					setTimeout(function() {
						next({});
					}, 1);
				}
				else {
					setTimeout(next, 1);
				}
			}
			,
			setInputVars : function(_vars){
				return this;
			}
		};
	}
	return ctx;
}

module.exports.createHandler = createHandler;