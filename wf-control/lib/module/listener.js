var DataStore = ProjRequire('./lib/data-store.js');
var dataStore = new DataStore();
var mod = {
	list : function(req, res) {
		var app = req.params.name;
		dataStore.getListeners({app:app}).then(function(result) {
			res.json({status:0,listeners:result});
		});
	},
	create : function(req, res) {
		var app = req.params.name;
		var listener = req.body.listener;
		dataStore.createListener({app:app,listener:listener}).then(function() {
			res.json({status:0});
		});
	},
	update : function(req, res) {
		var app = req.params.name;
		var id = req.params.id;
		var listener = req.body.listener;
		dataStore.updateListener({app:app,id:id,listener:listener}).then(function() {
			res.json({status:0});
		});
	},
}

module.exports = mod;