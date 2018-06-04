
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
	app.get('/app/:name/listener/:id', listenerModule.getSingle);
	app.put('/app/:name/listener/:id', listenerModule.update);
	app.delete('/app/:name/listener/:id', listenerModule.remove);
	
	var instanceModule = ProjRequire('lib/module/instance');
	app.get('/instance', instanceModule.list);
	app.post('/instance', instanceModule.create);
	app.get('/instance/:id', instanceModule.getSingle);
	app.put('/instance/:id', instanceModule.update);
	app.delete('/instance/:id', instanceModule.remove);
	app.get('/app/:name/instance', instanceModule.listForApp);
	app.post('/app/:name/instance/:id', instanceModule.createForApp);
	app.delete('/app/:name/instance/:id', instanceModule.deleteForApp);
	app.get('/instance/:id/app', instanceModule.listAppForInstance);
	app.post('/instance/:id/app/:name/:action', instanceModule.actionAppForInstance);
	
	app.post('/instance/:id/deploy', instanceModule.deploy);
}
module.exports = router;