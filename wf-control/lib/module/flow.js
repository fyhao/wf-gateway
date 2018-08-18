var DataStore = ProjRequire('./lib/data-store.js');
var mod = {
	_dataStore : new DataStore(),
	list : function(req, res) {
		var name = req.params.name;
		mod._dataStore.getFlows({app:name}).then(function(result) {
			res.json({status:0,flows:result});
		});
	},
	create : function(req, res) {
		var name = req.params.name;
		mod._dataStore.createFlow({app:name,flows:req.body.flows}).then(function() {
			res.json({status:0});
		});
	},
	update : function(req, res) {
		var name = req.params.name;
		var isAll = req.query.isAll;
		if(isAll && isAll == '1') {
			mod._dataStore.updateEntireFlow({app:name,flows:req.body.flows}).then(function() {
				res.json({status:0});
			});
		}
		else {
			mod._dataStore.updateFlow({app:name,flows:req.body.flows}).then(function() {
				res.json({status:0});
			});
		}
	},
	getSingle : function(req, res) {
		var name = req.params.name;
		var flowName = req.params.flowName;
		mod._dataStore.getFlows({app:name}).then(function(result) {
			res.json({status:0,flow:result[flowName]});
		});
	},
	updateSingle : function(req, res) {
		var name = req.params.name;
		var flowName = req.params.flowName;
		var flows = {};
		flows[flowName] = req.body.flow;
		mod._dataStore.updateFlow({app:name,flows:flows}).then(function() {
			res.json({status:0});
		});
	},
	deleteSingle : function(req, res) {
		var name = req.params.name;
		var flowName = req.params.flowName;
		mod._dataStore.deleteFlow({app:name,flowName:flowName}).then(function() {
			res.json({status:0});
		})
	}
}

module.exports = mod;