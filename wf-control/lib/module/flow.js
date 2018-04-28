var DataStore = ProjRequire('./lib/data-store.js');
var dataStore = new DataStore();
var mod = {
	list : function(req, res) {
		var name = req.params.name;
		dataStore.getFlows({app:name}).then(function(result) {
			res.json({status:0,flows:result});
		});
	},
	create : function(req, res) {
		var name = req.params.name;
		dataStore.createFlow({app:name,flows:req.body.flows}).then(function() {
			res.json({status:0});
		});
	}
}

module.exports = mod;