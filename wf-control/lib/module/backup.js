var DataStore = ProjRequire('./lib/data-store.js');

var mod = {
	_dataStore : new DataStore(),
	exportData : function(req, res) {
		mod._dataStore.exportData().then(function(result) {
			res.json(result);
		});
	},
	importData : function(req, res) {
		mod._dataStore.importData({input:req.body.input}).then(function(result) {
			res.json({status:result});
		});
	}
}

module.exports = mod;