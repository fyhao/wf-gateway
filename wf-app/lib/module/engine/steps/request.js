module.exports = {
	
	process : function(ctx, step, next) {
		if(step.action == 'getParam') {
			var value = ctx.req.param(step.param);
			ctx.vars[step.var] = value;
		}
		setTimeout(next, global.STEP_TIMEOUT);
	}
}