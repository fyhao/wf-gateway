var DataStore = ProjRequire('./lib/data-store.js');
var dataStore = new DataStore();
var unirest = require('unirest');
var mod = {
	info : function(req, res) {
		dataStore.getMonitorHistoricalData({limit:100}).then(function(result) {
			res.json(result);
		});
	},
	realtime : function(req, res) {
		dataStore.getMonitorRealtimeData().then(function(result) {
			res.json(result);
		});
	}
}

setInterval(function() {
	dataStore.getInstances().then(function(instances) {
		for(var i = 0; i < instances.length; i++) {
			var instance = instances[i];
			if(!instance.monHistory && !instance.monRealtime) continue;
			var id = instance.id;
			var conf = {
				action : 'monitor'
			};
			var deploy_endpoint = instance.host + '/control/deploy';
			unirest.post(deploy_endpoint)
			       .send({conf:JSON.stringify(conf)})
				   .end(function(appResponse) {
					   var ret = {status:0,appResponse:appResponse.body};
					   try {
						   var data = ret.appResponse.data;
						   data.instance_id = id;
						   data.host = instance.host;
						   if(instance.monHistory == 'true') {
						       dataStore.addMonitorHistoricalData({item:data});
						   }
						   if(instance.monRealtime == 'true') {
							   dataStore.updateMonitorRealtimeData({item:data});
						   }
					   } catch (e) {
						   
					   }
				   })
		}
	});
}, 60000);
setInterval(function() {
	dataStore.clearMonitorHistoricalData();
}, 86400000);
module.exports = mod;