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
				eventMgr.trigger(conf);
				res.json({status:0,action:action});
			});
		}
		else if(action == 'deployAppStatus') {
			eventMgr.trigger(conf);
			res.json({status:0,action:action});
		}
		else if(action == 'check') {
			dataStore.getApps().then(function(apps) {
				res.json({status:0,action:action,apps:apps});
			});
		}
		else {
			res.json({status:0,action:action});
		}
	}
	,
	registerRouting : function(app) {
		console.log('register routing for type http')
		eventMgr.init();
		eventMgr.addListener(function(conf) {
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
								app[appLi.method.toLowerCase()](appLi.endpoint, createHandler(appItem,appLi));
								console.log('register endpoint: app.' + appLi.method.toLowerCase() + '(' + appLi.endpoint + ') for app:' + appItem.app);
								registeredEndpoints.push(appLi);
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
								app[appLi.method.toLowerCase()](appLi.endpoint, createHandler(appItem,appLi));
								console.log('register endpoint: app.' + appLi.method.toLowerCase() + '(' + appLi.endpoint + ') for app:' + appItem.app);
								registeredEndpoints.push(appLi);
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
		});
	}
}
var createHandler = function(appItem, appLi) {
	return modServlet.createHandler(appItem, appLi);
}
var registeredEndpoints = [];
var registerApps = null;
var EventManager = function() {
	var listeners = [];
	this.init = function() {
		listeners = [];
	}
	this.addListener = function(fn) {
		listeners.push(fn);
	}
	this.trigger = function(conf) {
		listeners.forEach(function(i) {
			i(conf);
		});
	}
}
var eventMgr = new EventManager();

module.exports = mod;