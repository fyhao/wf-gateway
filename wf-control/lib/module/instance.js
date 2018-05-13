var DataStore = ProjRequire('./lib/data-store.js');
var dataStore = new DataStore();
var mod = {
	list : function(req, res) {
		dataStore.getInstances().then(function(result) {
			res.json({status:0,instances:result});
		});
	}
}

module.exports = mod;