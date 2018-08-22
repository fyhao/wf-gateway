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
	},
	duplicate : function(req, res) {
		var name = req.params.name;
		var newName = req.body.newName;
		console.log('Duplicate 1: getApp');
		mod._dataStore.getApp(name).then(function(app) {
			console.log('Duplicate 2: getFlows');
			mod._dataStore.getFlows({app:name}).then(function(flows) {
				console.log('Duplicate 3: getListeners');
				mod._dataStore.getListeners({app:name}).then(function(listeners) {
					// create app
					console.log('Duplicate 4: createApp');
					mod._dataStore.createApp({name:newName,description:app.description}).then(function(r) {
						if(r.status == 0) {
							// create flows
							console.log('Duplicate 5: createFlow');
							mod._dataStore.createFlow({app:newName,flows:flows}).then(function() {
								// create listeners
								var c = 0;
								var len = listeners.length;
								var checkNext = function() {
									if(c++ >= len) {
										// done
										console.log('Duplicate 7: done');
										res.json({status:0});
									}
									else {
										console.log('Duplicate 6: createListener: ' + (c-1) +'/' + listeners.length);
										console.log(listeners[c-1])
										delete listeners[c-1]['id'];
										mod._dataStore.createListener({app:newName,listener:listeners[c-1]}).then(function(r) {
											setTimeout(checkNext,100);
										});
									}
								}
								checkNext();
							});
						}
						else {
							res.json({status:101});
						}
					});
				});
			});
		});
	}
}

module.exports = mod;