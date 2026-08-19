var jobs = [];

function parseField(field, value) {
	return field.split(',').some(function(part) {
		if (part === '*') return true;
		var step = /^\*\/(\d+)$/.exec(part);
		if (step) return value % Number(step[1]) === 0;
		return Number(part) === value;
	});
}

function matches(expression, date) {
	var fields = expression.trim().split(/\s+/);
	if (fields.length === 5) fields.unshift('0');
	if (fields.length !== 6) return false;
	return parseField(fields[0], date.getSeconds()) && parseField(fields[1], date.getMinutes()) &&
		parseField(fields[2], date.getHours()) && parseField(fields[3], date.getDate()) &&
		parseField(fields[4], date.getMonth() + 1) && parseField(fields[5], date.getDay());
}

function isValid(expression) {
	var fields = expression.trim().split(/\s+/);
	if (fields.length !== 5 && fields.length !== 6) return false;
	return fields.every(function(field) { return /^(\*|\*\/\d+|\d+)(,(\*|\*\/\d+|\d+))*$/.test(field); });
}

function clearJobs() {
	jobs.forEach(function(job) { clearInterval(job); });
	jobs = [];
}

function register(apps, triggerFn) {
	clearJobs();
	(apps || []).forEach(function(appItem) {
		if (appItem.status !== 'enabled' || !appItem.listeners) return;
		appItem.listeners.forEach(function(listener) {
			if (listener.type === 'cron' && listener.expression && isValid(listener.expression)) {
				jobs.push(setInterval(function() {
					if (matches(listener.expression, new Date())) triggerFn(appItem, listener);
				}, 1000));
			}
		});
	});
}

module.exports = { register: register, clearJobs: clearJobs, _getJobs: function() { return jobs; }, _matches: matches };
