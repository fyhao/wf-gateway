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
	},
	update : function(req, res) {
		var name = req.params.name;
		var isAll = req.query.isAll;
		if(isAll && isAll == '1') {
			dataStore.updateEntireFlow({app:name,flows:req.body.flows}).then(function() {
				res.json({status:0});
			});
		}
		else {
			dataStore.updateFlow({app:name,flows:req.body.flows}).then(function() {
				res.json({status:0});
			});
		}
	},
	getSingle : function(req, res) {
		var name = req.params.name;
		var flowName = req.params.flowName;
		dataStore.getFlows({app:name}).then(function(result) {
			res.json({status:0,flow:result[flowName]});
		});
	},
	updateSingle : function(req, res) {
		var name = req.params.name;
		var flowName = req.params.flowName;
		var flows = {};
		flows[flowName] = req.body.flow;
		dataStore.updateFlow({app:name,flows:flows}).then(function() {
			res.json({status:0});
		});
	},
	deleteSingle : function(req, res) {
		var name = req.params.name;
		var flowName = req.params.flowName;
		dataStore.deleteFlow({app:name,flowName:flowName}).then(function() {
			res.json({status:0});
		})
	}
}

module.exports = mod;