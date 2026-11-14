var unirest = require('../../../http-client');
module.exports = {
	process : function(ctx, step, checkNext) {
		if(typeof step.method === 'undefined') step.method = 'GET';
		var frequestObj = {
			url : step.url,
			method : step.method
		};
		frequestObj.errorCallback = function() {
			process.nextTick(checkNext);
		}
		if(typeof step.params !== 'undefined') frequestObj.params = step.params;
		if(typeof step.headers !== 'undefined') {
			var _headers = step.headers;
			if(typeof step.headers == 'string') {
				// 1) check if json first, if not, then treat it as variable name
				try { JSON.parse(step.headers) } catch (e) {
					_headers = ctx.vars[step.headers];
				}
			}
			frequestObj.headers = _headers;
		}
		if(typeof step.varResponse !== 'undefined') {
			frequestObj.callback = function(body, response) {
				ctx.vars[step.varResponse] = response;
				process.nextTick(checkNext);
			}
		}
		else if(typeof step.varJson !== 'undefined') {
			frequestObj.callbackJSON = function(json) {
				ctx.vars[step.varJson] = json;
				process.nextTick(checkNext);
			}
		}
		else if(typeof step.var !== 'undefined') {
			frequestObj.callback = function(body) {
				ctx.vars[step.var] = body;
				process.nextTick(checkNext);
			}
		}
		else {
			process.nextTick(checkNext);
			return;
		}
		(step.mockfrequest || frequest)(frequestObj);
	}
}


var frequest = function(args) {
	var method = args.method ? args.method : 'GET';
	var factory = unirest[method.toLowerCase()];
	if (!factory) { if (args.errorCallback) args.errorCallback(new Error('Unsupported HTTP method')); return; }
	var req = factory(args.url);
	if(args.headers) {
		if(typeof args.headers == 'string') {
			try {
				args.headers = JSON.parse(args.headers);
			} catch (e) {
				
			}
		}
		req.headers(args.headers);
	}
	if(args.params) {
		req.send(args.params);
	}
	req.end(function(resp) {
		if(resp.error) { if(args.errorCallback) args.errorCallback(resp.error); return; }
		if(args.callback) {
			var body = resp.body;
			/*
			if(typeof resp.body !== 'string') {
				body = JSON.stringify(resp.body);
			}
			*/
			if(args.callback.length == 2) {
				args.callback(body, resp);
			}
			else {
				args.callback(body);
			}
		}
		if(args.callbackJSON) {
			try {
				var json;
				if(typeof resp.body === 'string') {
					json = JSON.parse(resp.body);
				}
				else {
					json = resp.body;
				}
				/*
				else {
					json = resp.body;
				}
				*/
				if(args.callbackJSON.length == 2) {
					args.callbackJSON(json, resp);
				}
				else {
					args.callbackJSON(json);
				}
			} catch (e) {
				//console.log(e);
				if(args.errorCallback) args.errorCallback(e);
			}
		}
	})
}