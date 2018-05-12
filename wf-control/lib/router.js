
var router = function(app) {
	var appModule = ProjRequire('lib/module/app');
	app.get('/app', appModule.list);
	app.post('/app', appModule.create);
	app.get('/app/:name', appModule.item);
	app.put('/app/:name', appModule.update);
	app.delete('/app/:name', appModule.remove);
	
	var flowModule = ProjRequire('lib/module/flow');
	app.get('/app/:name/flow', flowModule.list);
	app.post('/app/:name/flow', flowModule.create);
	app.put('/app/:name/flow', flowModule.update);
	app.get('/app/:name/flow/:flowName', flowModule.getSingle);
	app.put('/app/:name/flow/:flowName', flowModule.updateSingle);
	app.delete('/app/:name/flow/:flowName', flowModule.deleteSingle);
	
	var listenerModule = ProjRequire('lib/module/listener');
	app.get('/app/:name/listener', listenerModule.list);
	app.post('/app/:name/listener', listenerModule.create);
	app.put('/app/:name/listener/:id', listenerModule.update);
}
module.exports = router;