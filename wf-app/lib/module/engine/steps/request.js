module.exports = {
	
	process : function(ctx, step, next) {
		if(step.action == 'getParam') {
			var value = ctx.req.query[step.key];
			ctx.vars[step.var] = value;
		}
		else if(step.action == 'getPathParam') {
			var value = ctx.req.params[step.key];
			ctx.vars[step.var] = value;
		}
		else if(step.action == 'getBody') {
			var value = ctx.req.body[step.key];
			ctx.vars[step.var] = value;
		}
		else if(step.action == 'getHeader') {
			var value = ctx.req.headers[step.key];
			ctx.vars[step.var] = value;
		}
		process.nextTick(next);
	}
}