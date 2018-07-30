var util = ProjRequire('lib/MyUtil');
module.exports = {
	
	process : function(ctx, step, checkNext) {
		if(step.flows && step.flows.length) {
			var noOfTasks = step.flows.length;
			var curExecuted = 0;
			var isDone = false;
			var nextWrapper = function() {
				// done
				if(isDone) return;
				process.nextTick(checkNext);
				isDone = true;
			}
			var checkNext2 = function() {
				curExecuted++;
				if(curExecuted == noOfTasks) {
					nextWrapper();
				}
			}
			setTimeout(nextWrapper, step.timeout);
			for(var i = 0; i < step.flows.length; i++) {
				var flow = step.flows[i];
				ctx.createFlowEngine(flow).execute(checkNext2);
			}
		}
		else {
			process.nextTick(checkNext);
		}
	}
}