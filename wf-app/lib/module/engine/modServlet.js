var DataStore = ProjRequire('./lib/data-store.js');
var dataStore = new DataStore();
var modFlow = require('./modFlow');

var createHandler = function(eventMgr, appItem, appLi) {
	
	return function(req, res) {
		// get all flows definition and execute
		//appItem.flows
		//appLi.flow (string)
		createContext(appItem.app, req, res).then(function(ctx) {
			ctx.createFlowEngine(appLi.flow).execute(function() {
				eventMgr.trigger('flowExecutedDone', {ctx:ctx});
			});
		});
	}
}
var dataStore_getApps = dataStore.getApps;
var createContext = function(app, req, res) {
	return new Promise(function(resolve,reject) {
		var flows = null;
		dataStore_getApps().then(function(apps) {
			apps.forEach(function(appItem) {
				if(appItem.app == app) {
					flows = appItem.flows;
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
					resolve(ctx);
				}
			});
		});
	});
}
var _injectUnitTest = function(opts) {
	dataStore_getApps = function() {
		return new Promise(function(resolve,reject) {
			var apps = opts.apps
			resolve(apps);
		});
	}
}
module.exports.createHandler = createHandler;
module.exports._injectUnitTest = _injectUnitTest;