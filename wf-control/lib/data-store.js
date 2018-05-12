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
			resolve();
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
}
var data = [];
var flowStore = {};
var listenersStore = {};
var global_id = 0;
module.exports = DataStore