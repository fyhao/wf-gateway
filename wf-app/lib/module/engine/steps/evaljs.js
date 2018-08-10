var util = ProjRequire('lib/MyUtil');
module.exports = {
	
	process : function(ctx, step, checkNext) {
		if(typeof step.var != 'undefined' && step.code.indexOf('return') == -1) {
			step.code = 'return ' + step.code;
		}
		var isNextWrapperCalled = false;
		var nextWrapper = function() {
			if(isNextWrapperCalled) return;
			process.nextTick(checkNext);
			isNextWrapperCalled = true;
		}
		
		var val = new Function('vars', 'ctx', 'util', 'next', 'vars; ctx; util; next; ' + step.code);
		try {
			ctx.vars[step.var] = val(ctx.vars, ctx, util, nextWrapper);
		} catch (e) {
			console.err(e);
		}
		
		if(typeof step.timeout != 'undefined') {
			setTimeout(nextWrapper, step.timeout);
		}
		else {
			process.nextTick(checkNext);
		}
	}
}