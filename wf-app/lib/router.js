
var router = function(app) {
	var controlModule = ProjRequire('lib/module/control');
	app.post('/control/deploy', controlModule.deploy);
}
module.exports = router;