var createHandler = function(appItem, appLi) {
	return function(req, res) {
		res.end('0');
	}
}
module.exports.createHandler = createHandler;