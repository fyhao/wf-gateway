
var router = function(app) {
	var controlModule = ProjRequire('lib/module/control');
	app.post('/control/deploy', controlModule.deploy);
	controlModule.registerRouting(app);
}
module.exports = router;