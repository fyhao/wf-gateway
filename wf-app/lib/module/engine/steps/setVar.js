module.exports = {
	
	process : function(ctx, step, next) {
		if(typeof step.options != 'undefined') {
			if(step.options.length) {
				for(var i = 0; i < step.options.length; i++) {
					var k = step.options[i].name;
					var v = step.options[i].value;
					if(typeof step.options[i].local !== 'undefined') {
						ctx._vars[k] = v;
					}
					else {
						ctx.vars[k] = v;
					}
				}
			}
			else if(typeof step.options == 'object') {
				for(var k in step.options) {
					var v = step.options[k];
					if(typeof step.local !== 'undefined') {
						ctx._vars[k] = v;
					}
					else {
						ctx.vars[k] = v;
					}
				}
			}
		}
		else {
			if(typeof step.local !== 'undefined') {
				ctx._vars[step.name] = step.value;
			}
			else {
				ctx.vars[step.name] = step.value;
			}
		}
		process.nextTick(next);
	}
}