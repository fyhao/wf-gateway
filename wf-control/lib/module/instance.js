var DataStore = ProjRequire('./lib/data-store.js');
var dataStore = new DataStore();
var unirest = require('unirest');
var mod = {
	list : function(req, res) {
		dataStore.getInstances().then(function(result) {
			res.json({status:0,instances:result});
		});
	},
	create : function(req, res) {
		var instance = {
			name : req.body.name,
			description : req.body.description,
			host : req.body.host
		};
		dataStore.createInstance({instance:instance}).then(function(result) {
			res.json({status:0, instance:result});
		});
	},
	update : function(req, res) {
		var instance = {
			name : req.body.name,
			description : req.body.description,
			host : req.body.host
		};
		var id = req.params.id;
		dataStore.updateInstance({instance:instance,id:id}).then(function(result) {
			res.json({status:0});
		});
	},
	remove : function(req, res) {
		var id = req.params.id;
		dataStore.deleteInstance({id:id}).then(function(result) {
			res.json({status:0});
		});
	},
	listForApp : function(req, res) {
		var name = req.params.name;
		dataStore.getInstancesForApp({app:name}).then(function(result) {
			res.json({status:0, instances:result});
		})
	},
	createForApp : function(req, res) {
		var name = req.params.name;
		var id = req.params.id;
		dataStore.createInstanceForApp({app:name,id:id}).then(function(status) {
			res.json({status:status});
		})
	},
	deleteForApp : function(req, res) {
		var name = req.params.name;
		var id = req.params.id;
		dataStore.deleteInstanceForApp({app:name,id:id}).then(function(status) {
			res.json({status:status});
		})
	},
	listAppForInstance : function(req, res) {
		var id = req.params.id;
		dataStore.getAppsForInstance({id:id}).then(function(result) {
			res.json({status:0,apps:result});
		});
	},
	actionAppForInstance : function(req, res) {
		var id = req.params.id;
		var name = req.params.name;
		var action = req.params.action;
		dataStore.actionAppForInstance({app:name,id:id,action:action}).then(function(result) {
			res.json({status:0});
		});
	},
	deploy : function(req, res) {
		var id = req.params.id;
		var conf = req.body.conf;
		dataStore.getInstance({id:id}).then(function(instance) {
			checkConf({instance:instance,conf:conf})
				.then(sendConfToInstance)
				.then(function(ret) {
					res.json(ret)
				});
			
		});
	}
}
var checkConf = function(opts) {
	return new Promise(function(resolve,reject) {
		if(opts.conf.action == 'deployAll') {
			dataStore.getAppsForInstance({id:opts.instance.id}).then(function(apps) {
				opts.conf.apps = [];
				var i = 0;
				var checkNext = function() {
					var app = apps[i].app;
					var status = apps[i].status;
					dataStore.getFlows({app:app}).then(function(flows) {
						dataStore.getListeners({app:app}).then(function(listeners) {
							opts.conf.apps.push({app:app, status:status, flows:flows, listeners:listeners});
							
							if(++i < apps.length) {
								checkNext();
							}
							else {
								resolve(opts);
							}
						});
					});
				}
				checkNext();
			});
		}
		else {
			resolve(opts)
		}
	});
}
var sendConfToInstance  = function(opts) {
	var instance = opts.instance;
	var conf = opts.conf;
	return new Promise(function(resolve,reject) {
		var deploy_endpoint = instance.host + '/control/deploy';
			unirest.post(deploy_endpoint)
			       .send({conf:JSON.stringify(conf)})
				   .end(function(appResponse) {
					   var ret = {status:0,appResponse:appResponse.body};
					   resolve(ret);
				   })
	})
}
module.exports = mod;