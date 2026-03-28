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
	if(status == -1) status = checkListenerCron(listener);
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
var checkListenerCron = function(listener) {
	if(listener.type != 'cron') return -1;
	if(!listener.cron || typeof listener.cron !== 'string' || listener.cron.trim() == '') return ERROR.INVALIDCRONEXPRESSION;
	if(!isValidCronExpression(listener.cron)) return ERROR.INVALIDCRONEXPRESSION;
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
var isValidCronExpression = function(expr) {
	// Validate standard 5-field cron expression: min hour dom month dow
	var parts = expr.trim().split(/\s+/);
	if(parts.length !== 5) return false;
	var ranges = [
		{min:0, max:59},  // minute
		{min:0, max:23},  // hour
		{min:1, max:31},  // day of month
		{min:1, max:12},  // month
		{min:0, max:7}    // day of week (0 and 7 both = Sunday)
	];
	for(var i = 0; i < 5; i++) {
		if(!isValidCronField(parts[i], ranges[i].min, ranges[i].max)) return false;
	}
	return true;
}
var isValidCronField = function(field, min, max) {
	if(field === '*') return true;
	// handle step values like */5 or 1-5/2
	if(field.indexOf('/') !== -1) {
		var stepParts = field.split('/');
		if(stepParts.length !== 2) return false;
		var step = parseInt(stepParts[1], 10);
		if(isNaN(step) || step < 1) return false;
		field = stepParts[0];
		if(field === '*') return true;
	}
	// handle range values like 1-5
	if(field.indexOf('-') !== -1) {
		var rangeParts = field.split('-');
		if(rangeParts.length !== 2) return false;
		var lo = parseInt(rangeParts[0], 10);
		var hi = parseInt(rangeParts[1], 10);
		return !isNaN(lo) && !isNaN(hi) && lo >= min && hi <= max && lo <= hi;
	}
	// handle list values like 1,3,5
	if(field.indexOf(',') !== -1) {
		var listParts = field.split(',');
		for(var j = 0; j < listParts.length; j++) {
			var val = parseInt(listParts[j], 10);
			if(isNaN(val) || val < min || val > max) return false;
		}
		return true;
	}
	// single number
	var num = parseInt(field, 10);
	return !isNaN(num) && num >= min && num <= max;
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
	INVALIDTYPE : 107,
	INVALIDCRONEXPRESSION : 108
};
module.exports = mod;