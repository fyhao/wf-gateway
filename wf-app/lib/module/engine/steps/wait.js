module.exports = {
	
	process : function(ctx, step, checkNext) {
		setTimeout(checkNext, step.timeout);
	}
}