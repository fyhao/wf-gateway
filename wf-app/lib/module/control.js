var DataStore = ProjRequire('./lib/data-store.js');
var dataStore = new DataStore();
var mod = {
	deploy : function(req, res) {
		if(typeof req.body.conf == 'string') {
			conf = JSON.parse(req.body.conf);
		}
		else {
			conf = req.body.conf;
		}
		var action = conf.action;
		if(action == 'deployAll') {
			var apps = conf.apps;
			dataStore.storeApps(apps).then(function(result) {
				res.json({status:0,action:action});
			});
		}
		else if(action == 'check') {
			dataStore.getApps().then(function(apps) {
				res.json({status:0,action:action,apps:apps});
			});
		}
		else {
			res.json({status:0,action:action});
		}
	}
}

module.exports = mod;