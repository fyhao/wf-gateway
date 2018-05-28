module.exports = {
	
	process : function(ctx, step, next) {
		var action = step.action;
		if(action != null) {
			if(action == 'setHeader') {
				ctx.res.set(step.key, step.value);
			}
			else if(action == 'getHeader') {
				ctx.vars[step.var] = ctx.res.get(step.key);
			}
		}
		else {
			ctx.res.end(step.body);
		}
		process.nextTick(next);
	}
}