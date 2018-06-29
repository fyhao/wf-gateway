var DataStore = ProjRequire('./lib/data-store.js');
var dataStore = new DataStore();
var mod = {
	exportData : function(req, res) {
		dataStore.exportData().then(function(result) {
			res.json(result);
		});
	},
	importData : function(req, res) {
		dataStore.importData({input:req.body.input}).then(function(result) {
			res.json({status:result});
		});
	}
}

module.exports = mod;