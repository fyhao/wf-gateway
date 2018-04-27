var appModule = ProjRequire('lib/module/app');
var router = function(app) {
	app.get('/app', appModule.list);
	app.post('/app', appModule.create);
	app.get('/app/:name', appModule.item);
}
module.exports = router;