var DataStore = function() {
	this.storeApps = function(apps) {
		return new Promise(function(resolve, reject) {
			appsStore = apps;
			resolve(true);
		})
	}
	this.saveAppFlow = function(app, flowName, flowObj) {
		return this.getApps().then(function(apps) {
			return new Promise(function(resolve,reject) {
				apps.forEach(function(appItem) {
					if(appItem.app == app) {
						appItem.flows[flowName] = flowObj;
					}
				});
				resolve(apps);
			});
		}).then(this.storeApps);
	}
	this.saveAppFlows = function(app, flows) {
		return this.getApps().then(function(apps) {
			return new Promise(function(resolve,reject) {
				apps.forEach(function(appItem) {
					if(appItem.app == app) {
						appItem.flows = flows;
					}
				});
				resolve(apps);
			});
		}).then(this.storeApps);
	}
	this.getApps = function() {
		return new Promise(function(resolve, reject) {
			resolve(appsStore);
		})
	}
}
var appsStore = {};
var global_id = 0;
module.exports = DataStore