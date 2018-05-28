// IMPORT
module.exports = {
	
	processStep : function(ctx, step, next) {
		_processStep(ctx, step, next);
	}
	
};

// public variable
var stepDefinitions = [];

// CONSTANTS
global.STEP_TIMEOUT = 0;

// REGION _processStep

var _processStep = function(ctx, step, next) {
	var pro = new StepProcessor(ctx, step, next);
	pro.process();
}
var StepProcessor = function(ctx, step, next) {
	this.ctx = ctx;
	this.step = step;
	
	var def = null;
	var spec = null;
	var init = function() {
		findDef();
	}
	var findDef = function() {
		if(typeof stepDefinitions[step.type] !== 'undefined') {
			def = stepDefinitions[step.type];
		}
		else {
			try {
				def = require('./steps/' + step.type + '.js');
				stepDefinitions[step.type] = def;
			} catch (e) {
				//console.log(e);
			}
		}
	}
	this.process = function() {
		if(def === null) {
			setTimeout(next, 0);
			return;
		}
		def.process(ctx, step, next);
	}
	init();
}

// ENDREGION _processStep