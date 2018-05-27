module.exports = {
	
	process : function(ctx, step, next) {
		if(typeof step.log != 'undefined') {
			console.log("LOG: " + new Date().toString() + ": " + step.log);
		}
		else if(typeof step.dumpSystemLog != 'undefined') {
			if(typeof ctx._logs != 'undefined') {
				var logs = ctx._logs;
				var msg = '';
				for(var i = 0; i < logs.length; i++) {
					msg += logs[i] + '\n';
				}
				alert(msg);
				ctx._logs = [];
			}
		}
		setTimeout(next, global.STEP_TIMEOUT);
	}
}