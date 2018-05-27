var DataStore = ProjRequire('./lib/data-store.js');
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
		
		eventMgr.addListener(function(conf) {
			// unregister endpoints first
			registeredEndpoints.forEach(function(ep) {
				for(var i = app._router.stack.length - 1; i >= 0; i--) {
					var p = app._router.stack[i].path;
					if(typeof p != 'undefined' && p.trim().length > 0 && p.indexOf('/control') == -1) {
						app._router.stack.splice(i,1);
					}
				}
			})
			registeredEndpoints = [];
			// register endpoints
			conf.apps.forEach(function(appItem) {
				appItem.listeners.forEach(function(appLi) {
					if(appLi.type == 'http') {
						app[appLi.method.toLowerCase()](appLi.endpoint, defaultHandler);
						console.log('register endpoint: app.' + appLi.method.toLowerCase() + '(' + appLi.endpoint + ')');
						registeredEndpoints.push(appLi);
					}
				});
			});
		});
	}
}
var defaultHandler = function(req, res) {
	res.end('0');
}
var registeredEndpoints = [];
var EventManager = function() {
	var listeners = [];
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