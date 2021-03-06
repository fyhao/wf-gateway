var DataStore = ProjRequire('./lib/data-store.js');
var mod = {
	_dataStore : new DataStore(),
	list : function(req, res) {
		var app = req.params.name;
		mod._dataStore.getListeners({app:app}).then(function(result) {
			res.json({status:0,listeners:result});
		});
	},
	create : function(req, res) {
		var app = req.params.name;
		var listener = req.body.listener;
		var status = validateListener(listener);
		if(status == 0) {
			mod._dataStore.createListener({app:app,listener:listener}).then(function(resultListener) {
				res.json({status:0,listener:resultListener});
			});
		}
		else {
			res.json({status:status});
		}
	},
	getSingle : function(req, res) {
		var app = req.params.name;
		var id = req.params.id;
		mod._dataStore.getListener({app:app,id:id}).then(function(resultListener) {
			res.json({status:0,listener:resultListener});
		});
	},
	update : function(req, res) {
		var app = req.params.name;
		var id = req.params.id;
		var listener = req.body.listener;
		mod._dataStore.updateListener({app:app,id:id,listener:listener}).then(function() {
			res.json({status:0});
		});
	},
	remove : function(req, res) {
		var app = req.params.name;
		var id = req.params.id;
		mod._dataStore.deleteListener({app:app,id:id}).then(function() {
			res.json({status:0});
		});
	},
}

// business validation
var validateListener = function(listener) {
	var status = -1;
	if(status == -1) status = checkListenerHttp(listener);
	if(status == -1) status = checkListenerAppLifecycle(listener);
	if(status == -1) status = checkListenerDummy(listener); // any other listeners type extend here like this way
	if(status == -1) status = ERROR.INVALIDTYPE;
	return status;
}

var checkListenerHttp = function(listener) {
	if(listener.type != 'http') return -1;
	// check http listener type specific
	if(typeof listener.method == 'undefined') listener.method = 'GET';
	if(isNotAllowedMethod(listener.method)) return ERROR.NOTALLOWEDMETHOD;
	if(isInvalidEndpoint(listener.endpoint)) return ERROR.ENDPOINTINVALID;
	listener.endpoint = listener.endpoint.trim();
	var errorStatus = checkInvalidRequestParams(listener.requestParams);
	if(errorStatus == 0) errorStatus = checkInvalidRequestHeaders(listener.requestHeaders);
	return errorStatus;
}
var checkListenerAppLifecycle = function(listener) {
	if(listener.type != 'app_init') return -1;
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
	return false;
}
var checkInvalidRequestParams = function(requestParams) {
	if(!requestParams) return 0;
	for(var i = 0; i < requestParams.length; i++) {
		var param = requestParams[i];
		if(typeof param.condition == 'undefined') param.condition = 'optional';
		if(param.condition != 'required' && param.condition != 'optional') return ERROR.INVALIDREQUESTPARAMCONDITION;
		if(typeof param.type == 'undefined') param.type = 'text';
		if(param.type != 'text' && param.type != 'number' && param.type != 'boolean' && param.type != 'decimal')
			return ERROR.INVALIDREQUESTPARAMTYPE;
	}
	return 0;
}
var checkInvalidRequestHeaders = function(requestHeaders) {
	if(!requestHeaders) return 0;
	for(var i = 0; i < requestHeaders.length; i++) {
		var param = requestHeaders[i];
		if(typeof param.condition == 'undefined') param.condition = 'optional';
		if(param.condition != 'required' && param.condition != 'optional') return ERROR.INVALIDREQUESTHEADERCONDITION;
		if(typeof param.type == 'undefined') param.type = 'text';
		if(param.type != 'text' && param.type != 'number' && param.type != 'boolean' && param.type != 'decimal')
			return ERROR.INVALIDREQUESTHEADERTYPE;
	}
	return 0;
}

var ERROR = {
	NOTALLOWEDMETHOD : 101,
	ENDPOINTINVALID : 102,
	INVALIDREQUESTPARAMCONDITION : 103,
	INVALIDREQUESTPARAMTYPE : 104,
	INVALIDREQUESTHEADERCONDITION : 105,
	INVALIDREQUESTHEADERTYPE : 106,
	INVALIDTYPE : 107
};
module.exports = mod;