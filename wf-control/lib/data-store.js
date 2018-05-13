var DataStore = function() {
	this.getAppList = function(entity) {
		return new Promise(function(resolve, reject) {
			resolve(data);
		})
	}
	this.createApp = function(item) {
		data.push(item);
		flowStore[item.name] = {};
		listenersStore[item.name] = [];
	}
	this.getApp = function(name) {
		return new Promise(function(resolve, reject) {
			var found = false;
			for(var i = 0; i < data.length; i++) {
				if(data[i].name == name) {
					resolve(data[i]);
					found = true;
					break;
				}
			}
			if(!found) {
				reject({status:100})
			}
		})
	}
	this.updateApp = function(name, fields) {
		return new Promise(function(resolve, reject) {
			var found = false;
			for(var i = 0; i < data.length; i++) {
				if(data[i].name == name) {
					for(var j in fields) {
						data[i][j] = fields[j];
					}
					resolve(data[i]);
					found = true;
					break;
				}
			}
			if(!found) {
				reject({status:100})
			}
		})
	}
	this.deleteApp = function(name, fields) {
		return new Promise(function(resolve, reject) {
			var found = false;
			for(var i = 0; i < data.length; i++) {
				if(data[i].name == name) {
					data.splice(i,1);
					delete flowStore[name];
					delete listenersStore[name];
					resolve();
					found = true;
					break;
				}
			}
			if(!found) {
				reject({status:100})
			}
		})
	}
	this.getFlows = function(opts) {
		return new Promise(function(resolve,reject) {
			var app = opts.app;
			var flows = flowStore[app];
			resolve(flows);
		});
	}
	this.createFlow = function(opts) {
		return new Promise(function(resolve,reject) {
			var app = opts.app;
			var flows = flowStore[app];
			for(var i in opts.flows) {
				flows[i] = opts.flows[i];
			}
			resolve();
		});
	}
	this.updateFlow = function(opts) {
		return new Promise(function(resolve,reject) {
			var app = opts.app;
			var flows = flowStore[app];
			for(var i in opts.flows) {
				flows[i] = opts.flows[i];
			}
			resolve();
		});
	}
	this.deleteFlow = function(opts) {
		return new Promise(function(resolve,reject) {
			var app = opts.app;
			var flowName = opts.flowName;
			delete flowStore[app][flowName];
			resolve();
		});
	}
	this.getListeners = function(opts) {
		return new Promise(function(resolve,reject) {
			var app = opts.app;
			var listeners = listenersStore[app];
			resolve(listeners);
		});
	}
	this.createListener = function(opts) {
		return new Promise(function(resolve,reject) {
			var app = opts.app;
			var listener = opts.listener;
			listener.id = ++global_id;
			listenersStore[app].push(listener);
			resolve(listener);
		});
	}
	this.updateListener = function(opts) {
		return new Promise(function(resolve,reject) {
			var app = opts.app;
			var listener = opts.listener;
			var id = opts.id;
			for(var i = 0; i < listenersStore[app].length; i++) {
				if(listenersStore[app][i].id == id) {
					for(var j in listener) {
						listenersStore[app][i][j] = listener[j];
					}
				}
			}
			resolve();
		});
	}
	this.deleteListener = function(opts) {
		return new Promise(function(resolve,reject) {
			var app = opts.app;
			var listener = opts.listener;
			var id = opts.id;
			for(var i = 0; i < listenersStore[app].length; i++) {
				if(listenersStore[app][i].id == id) {
					listenersStore[app].splice(i,1);
					break;
				}
			}
			resolve();
		});
	}
	this.getInstances = function(opts) {
		return new Promise(function(resolve,reject) {
			resolve(instancesStore);
		});
	}
	this.createInstance = function(opts) {
		return new Promise(function(resolve,reject) {
			var instance = opts.instance;
			instance.id = ++global_id;
			instancesStore.push(instance);
			resolve(instance);
		});
	}
	this.updateInstance = function(opts) {
		return new Promise(function(resolve,reject) {
			var instance = opts.instance;
			for(var i = 0; i < instancesStore.length; i++) {
				if(instancesStore[i].id == opts.id) {
					for(var j in instance) {
						instancesStore[i][j] = instance[j];
					}
					break;
				}
			}
			resolve();
		});
	}
	this.deleteInstance = function(opts) {
		return new Promise(function(resolve,reject) {
			var id = opts.id;
			for(var i = 0; i < instancesStore.length; i++) {
				if(instancesStore[i].id == id) {
					instancesStore.splice(i,1);
					break;
				}
			}
			resolve();
		});
	}
	this.getInstancesForApp = function(opts) {
		return new Promise(function(resolve,reject) {
			var instance_id = [];
			for(var i = 0; i < appInstanceMappingStore.length; i++) {
				var m = appInstanceMappingStore[i];
				if(m.app == opts.app) {
					instance_id.push(m.instance_id);
				}
			}
			var instances = [];
			for(var i = 0; i < instance_id.length; i++) {
				for(j = 0; j < instancesStore.length; j++) {
					if(instancesStore[j].id == instance_id[i]) {
						instances.push(instancesStore[j]);
					}
				}
			}
			resolve(instances);
		});
	}
	this.createInstanceForApp = function(opts) {
		return new Promise(function(resolve,reject) {
			for(var i = 0; i < appInstanceMappingStore.length; i++) {
				var m = appInstanceMappingStore[i];
				if(m.app == opts.app && m.instance_id == opts.id) {
					resolve(101);
					return;
				}
			}
			appInstanceMappingStore.push({app:opts.app,instance_id:opts.id,status:'disabled'});
			resolve(0);
		});
	}
	this.deleteInstanceForApp = function(opts) {
		return new Promise(function(resolve,reject) {
			var isDeleted = false;
			for(var i = 0; i < appInstanceMappingStore.length; i++) {
				var m = appInstanceMappingStore[i];
				if(m.app == opts.app && m.instance_id == opts.id) {
					appInstanceMappingStore.splice(i,1);
					isDeleted = true;
				}
			}
			resolve(isDeleted ? 0 : 102);
		});
	}
	this.getAppsForInstance = function(opts) {
		return new Promise(function(resolve,reject) {
			var apps = [];
			for(var i = 0; i < appInstanceMappingStore.length; i++) {
				var m = appInstanceMappingStore[i];
				if(m.instance_id == opts.id) {
					apps.push({app:m.app,status:m.status});
				}
			}
			resolve(apps);
		});
	}
	this.actionAppForInstance = function(opts) {
		return new Promise(function(resolve,reject) {
			for(var i = 0; i < appInstanceMappingStore.length; i++) {
				var m = appInstanceMappingStore[i];
				if(m.app == opts.app && m.instance_id == opts.id) {
					m.status = opts.action == 'enable' ? 'enabled' : 'disabled';
				}
			}
			resolve();
		});
	}
}
var data = [];
var flowStore = {};
var listenersStore = {};
var instancesStore = [];
var appInstanceMappingStore = []; // app name and instance id mapping
var global_id = 0;
module.exports = DataStore