var DataStore = ProjRequire('./lib/data-store.js');
var dataStore = new DataStore();
var mod = {
	list : function(req, res) {
		var name = req.params.name;
		dataStore.getListeners({app:name}).then(function(result) {
			res.json({status:0,listeners:result});
		});
	},
}

module.exports = mod;