module.exports = {
	
	process : function(ctx, step, next) {
		ctx.res.end(step.body);
		process.nextTick(next);
	}
}