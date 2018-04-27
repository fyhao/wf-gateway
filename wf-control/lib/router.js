var appModule = ProjRequire('lib/module/app');
var router = function(app) {
	app.get('/app/list', appModule.list);
	app.get('/app/create', appModule.create);
}
module.exports = router;