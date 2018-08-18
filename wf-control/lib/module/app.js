var DataStore = ProjRequire('./lib/data-store.js');

var mod = {
	_dataStore : new DataStore(),
	
	list : function(req, res) {
		mod._dataStore.getAppList().then(function(result) {
			res.json(result);
		});
	},
	create : function(req, res) {
		var item = {
			name : req.body.name, // req.body.xxx for POST req.query.xxx for GET then URL :xxx for req.params
			description : req.body.description
		};
		if(item.name == '') {
			res.json({status:100});
		}
		else {
			mod._dataStore.createApp(item).then(function(result) {
				res.json({status:result.status})
			});
		}
	},
	item : function(req, res) {
		var name = req.params.name;
		mod._dataStore.getApp(name).then(function(result) {
			res.json(result);
		}, function(err) {
			res.json(err)
		});
	},
	update : function(req, res) {
		var name = req.params.name;
		mod._dataStore.updateApp(name, req.body.fields).then(function(result) {
			res.json({status:0});
		}, function(err) {
			res.json({status:100});
		});
	},
	remove : function(req, res) {
		var name = req.params.name;
		mod._dataStore.deleteApp(name).then(function(result) {
			res.json({status:0});
		}, function(err) {
			res.json({status:100});
		});
	}
}

module.exports = mod;