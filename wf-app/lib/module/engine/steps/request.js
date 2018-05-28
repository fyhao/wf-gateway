module.exports = {
	
	process : function(ctx, step, next) {
		if(step.action == 'getParam') {
			var value = ctx.req.param(step.key);
			ctx.vars[step.var] = value;
		}
		setTimeout(next, global.STEP_TIMEOUT);
	}
}