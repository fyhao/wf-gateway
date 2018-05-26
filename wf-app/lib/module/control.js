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
		res.json({status:0,action:action});
	}
}

module.exports = mod;