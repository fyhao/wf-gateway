module.exports = {
	
	process : function(ctx, step, checkNext) {
		var delay = typeof step.delay != 'undefined' ? parseInt(step.delay) : 1;
		setTimeout(function() {
			ctx.createFlowEngine(step.flow).execute(function() {});
		}, delay);
		process.nextTick(checkNext);
	}
}