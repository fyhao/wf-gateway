var DataStore = ProjRequire('./lib/data-store.js');
var dataStore = new DataStore();
var mod = {
	info : function(req, res) {
		dataStore.getMonitorHistoricalData({limit:100}).then(function(result) {
			res.json(result);
		});
	}
}

setInterval(function() {
	dataStore.getInstances().then(function(instances) {
		for(var i = 0; i < instances.length; i++) {
			var id = instances[i].id;
			var conf = {
				action : 'monitor'
			};
			var deploy_endpoint = instance.host + '/control/deploy';
			unirest.post(deploy_endpoint)
			       .send({conf:JSON.stringify(conf)})
				   .end(function(appResponse) {
					   var ret = {status:0,appResponse:appResponse.body};
					   console.log(ret)
				   })
		}
	});
}, 10000);

module.exports = mod;