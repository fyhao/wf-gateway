var DataStore = ProjRequire('./lib/data-store.js');
var dataStore = new DataStore();
var mod = {
	list : function(req, res) {
		dataStore.getAppList().then(function(result) {
			res.json(result);
		});
	},
	create : function(req, res) {
		var item = {
			name : req.body.name // req.body.xxx for POST req.query.xxx for GET then URL :xxx for req.params
		};
		dataStore.createApp(item);
		res.json({status:0});
	},
	item : function(req, res) {
		var name = req.params.name;
		dataStore.getApp(name).then(function(result) {
			res.json(result);
		}, function(err) {
			res.json(err)
		});
	}
}

module.exports = mod;