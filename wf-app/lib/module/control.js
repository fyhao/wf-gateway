var DataStore = ProjRequire('./lib/data-store.js');
var modServlet = ProjRequire('./lib/module/engine/modServlet');
var dataStore = new DataStore();
var mod = {
	deploy : function(req, res) {
		if(typeof req.body.conf == 'string') {
			conf = JSON.parse(req.body.conf);
		}
		else {
			conf = req.body.conf;
		}
		var action = conf.action;
		if(action == 'deployAll') {
			var apps = conf.apps;
			dataStore.storeApps(apps).then(function(result) {
				eventMgr.triggerConf('registerRouting', conf);
				res.json({status:0,action:action});
			});
		}
		else if(action == 'deployAppStatus') {
			eventMgr.triggerConf('registerRouting', conf);
			res.json({status:0,action:action});
		}
		else if(action == 'deployAppFlow') {
			dataStore.saveAppFlow(conf.app, conf.flow, conf.flowObj).then(function(b) {
				eventMgr.triggerConf('registerRouting', conf);
				res.json({status:0,action:action});
			});
		}
		else if(action == 'deployAppFlows') {
			dataStore.saveAppFlows(conf.app, conf.flows).then(function(b) {
				eventMgr.triggerConf('registerRouting', conf);
				res.json({status:0,action:action});
			});
		}
		else if(action == 'deployApp') {
			dataStore.saveApp(conf.app, conf.flows, conf.listeners).then(function(b) {
				eventMgr.triggerConf('registerRouting', conf);
				res.json({status:0,action:action});
			});
		}
		else if(action == 'check') {
			dataStore.getApps().then(function(apps) {
				res.json({status:0,action:action,apps:apps});
			});
		}
		else if(action == 'monitor') {
			const os = require('os');
			var data = {
				cpu : 0,
				mem : os.freemem(),
				disk : 0,
				server_time : new Date().toString(),
				requestCount : modServlet.analytic.requestCount,
				flowData : modServlet.analytic.flows
			};
			res.json({status:0, data:data});
		}
		else {
			res.json({status:0,action:action});
		}
	}
	,
	registerRouting : function(app) {
		console.log('register routing for type http')
		eventMgr.init();
		eventMgr.registerEventHandler('registerRouting', function(conf) {
			if(conf.action == 'deployAll') { // deployAll then unregister and register all
				// unregister endpoints first
				registeredEndpoints.forEach(function(ep) {
					for(var i = app._router.stack.length - 1; i >= 0; i--) {
						var r = app._router.stack[i].route;
						if(typeof r != 'undefined' && r.path != 'undefined' && r.path.trim().length > 0 && r.path.indexOf('/control') == -1
							&& r.path == ep.endpoint) {
							app._router.stack.splice(i,1);
						}
					}
				})
				registeredEndpoints = [];
				// register endpoints
				conf.apps.forEach(function(appItem) {
					if(appItem.status == 'enabled') {
						appItem.listeners.forEach(function(appLi) {
							if(appLi.type == 'http') {
								app[appLi.method.toLowerCase()](appLi.endpoint, createHandler(eventMgr, appItem,appLi));
								console.log('register endpoint: app.' + appLi.method.toLowerCase() + '(' + appLi.endpoint + ') for app:' + appItem.app);
								registeredEndpoints.push(appLi);
							}
							else if(appLi.type == 'app_init') {
								// trigger app_init lifecycle
								triggerFlow(appItem.flows, appLi.flow);
							}
						});
						
					}
				});
				registeredApps = conf.apps;
			}
			else if(conf.action == 'deployAppStatus') {
				registeredApps.forEach(function(appItem) {
					var changed = false;
					if(appItem.app == conf.app) {
						if(appItem.status != conf.status) {
							changed = true;
							appItem.status = conf.status;
						}
					}
					if(changed && appItem.status == 'enabled') {
						appItem.listeners.forEach(function(appLi) {
							if(appLi.type == 'http') {
								app[appLi.method.toLowerCase()](appLi.endpoint, createHandler(eventMgr, appItem,appLi));
								console.log('register endpoint: app.' + appLi.method.toLowerCase() + '(' + appLi.endpoint + ') for app:' + appItem.app);
								registeredEndpoints.push(appLi);
							}
							else if(appLi.type == 'app_init') {
								// trigger app_init lifecycle
								triggerFlow(appItem.flows, appLi.flow);
							}
						});
					}
					else if(changed && appItem.status == 'disabled') {
						appItem.listeners.forEach(function(appLi) {
							for(var i = app._router.stack.length - 1; i >= 0; i--) {
								var r = app._router.stack[i].route;
								if(typeof r != 'undefined' && r.path != 'undefined' && r.path.trim().length > 0 && r.path.indexOf('/control') == -1
									&& r.path == appLi.endpoint) {
									app._router.stack.splice(i,1);
								}
							}
						});
					}
				});
			}
			else if(conf.action == 'deployAppFlow') {
				registeredApps.forEach(function(appItem) {
					var changed = false;
					if(appItem.app == conf.app) {
						appItem.flows[conf.flow] = conf.flowObj;
						eventMgr.trigger('flowUpdated', {app:conf.app});
					}
				});
			}
			else if(conf.action == 'deployAppFlows') {
				registeredApps.forEach(function(appItem) {
					var changed = false;
					if(appItem.app == conf.app) {
						appItem.flows = conf.flows;
						eventMgr.trigger('flowUpdated', {app:conf.app});
					}
				});
			}
			else if(conf.action == 'deployApp') {
				registeredApps.forEach(function(appItem) {
					var changed = false;
					if(appItem.app == conf.app) {
						appItem.flows = conf.flows;
						appItem.listeners = conf.listeners;
						//unregister
						appItem.listeners.forEach(function(appLi) {
							for(var i = app._router.stack.length - 1; i >= 0; i--) {
								var r = app._router.stack[i].route;
								if(typeof r != 'undefined' && r.path != 'undefined' && r.path.trim().length > 0 && r.path.indexOf('/control') == -1
									&& r.path == appLi.endpoint) {
									app._router.stack.splice(i,1);
								}
							}
						});
						//register
						appItem.listeners.forEach(function(appLi) {
							if(appLi.type == 'http') {
								app[appLi.method.toLowerCase()](appLi.endpoint, createHandler(eventMgr, appItem,appLi));
								console.log('register endpoint: app.' + appLi.method.toLowerCase() + '(' + appLi.endpoint + ') for app:' + appItem.app);
								registeredEndpoints.push(appLi);
							}
							else if(appLi.type == 'app_init') {
								// trigger app_init lifecycle
								triggerFlow(appItem.flows, appLi.flow);
							}
						});
					}
				});
			}
		});
	}
}
var createHandler = function(eventMgr, appItem, appLi) {
	return modServlet.createHandler(eventMgr, appItem, appLi);
}
var modFlow = ProjRequire('./lib/module/engine/modFlow');
var triggerFlow = function(flows, flow) {
	var ctx = {}; // context object
	ctx.vars = {};
	ctx.flows = flows;
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
	ctx.createFlowEngine(flow).execute(function() {});
}
var registeredEndpoints = [];
var registerApps = null;
var EventManager = function() {
	var listeners = [];
	this.init = function() {
		listeners = [];
	}
	this.registerEventHandler = function(name, fn) {
		listeners.push({name:name,fn:fn});
	}
	this.triggerConf = function(name, conf) {
		listeners.forEach(function(i) {
			if(i.name == name) {
				i.fn(conf);
			}
		});
	}
	this.trigger = function(name, opts) {
		listeners.forEach(function(i) {
			if(i.name == name) {
				i.fn(opts);
			}
		});
	}
}
var eventMgr = new EventManager();

module.exports = mod;