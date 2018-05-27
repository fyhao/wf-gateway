module.exports = {
	
	process : function(ctx, step, next) {
		ctx.res.end(step.body);
		setTimeout(next, global.STEP_TIMEOUT);
	}
}