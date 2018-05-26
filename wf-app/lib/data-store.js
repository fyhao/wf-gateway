var DataStore = function() {
	this.storeApps = function(apps) {
		return new Promise(function(resolve, reject) {
			appsStore = apps;
			resolve(true);
		})
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