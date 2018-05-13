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
		var status = validateListener(listener);
		if(status == 0) {
			dataStore.createListener({app:app,listener:listener}).then(function(resultListener) {
				res.json({status:0,listener:resultListener});
			});
		}
		else {
			res.json({status:status});
		}
	},
	update : function(req, res) {
		var app = req.params.name;
		var id = req.params.id;
		var listener = req.body.listener;
		dataStore.updateListener({app:app,id:id,listener:listener}).then(function() {
			res.json({status:0});
		});
	},
	remove : function(req, res) {
		var app = req.params.name;
		var id = req.params.id;
		dataStore.deleteListener({app:app,id:id}).then(function() {
			res.json({status:0});
		});
	},
}

// business validation
var validateListener = function(listener) {
	var status = -1;
	if(status == -1) status = checkListenerHttp(listener);
	if(status == -1) status = checkListenerDummy(listener); // any other listeners type extend here like this way
	return status;
}

var checkListenerHttp = function(listener) {
	if(listener.type != 'http') return -1;
	// check http listener type specific
	if(typeof listener.method == 'undefined') listener.method = 'GET';
	if(isNotAllowedMethod(listener.method)) return ERROR.NOTALLOWEDMETHOD;
	if(isInvalidEndpoint(listener.endpoint)) return ERROR.ENDPOINTINVALID;
	listener.endpoint = listener.endpoint.trim();
	return 0;
}
var checkListenerDummy = function(listener) {
	return -1;
}

// utility
var isNotAllowedMethod = function(method) {
	var allowed = ['GET','POST','PUT','DELETE'];
	return allowed.indexOf(method) == -1;
}
var isInvalidEndpoint = function(endpoint) {
	if(endpoint == null || endpoint.trim() == '') return true;
	if(endpoint.startsWith('http://')) return false;
	if(endpoint.startsWith('https://')) return false;
	return true;
}

var ERROR = {
	NOTALLOWEDMETHOD : 101,
	ENDPOINTINVALID : 102
};
module.exports = mod;