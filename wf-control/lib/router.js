var appModule = ProjRequire('lib/module/app');
var router = function(app) {
	app.get('/app/list', appModule.list)
}
module.exports = router;