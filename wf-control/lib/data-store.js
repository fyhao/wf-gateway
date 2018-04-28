var DataStore = function() {
	this.getAppList = function(entity) {
		return new Promise(function(resolve, reject) {
			resolve(data);
		})
	}
	this.createApp = function(item) {
		data.push(item);
		flowStore[item.name] = {};
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
}
var data = [];
var flowStore = {};
module.exports = DataStore