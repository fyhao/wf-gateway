var DataStore = ProjRequire('./lib/data-store.js');
var router = function(app, serverOpts) {
	if(typeof serverOpts == 'undefined') serverOpts = {};
	var modules = [];
	var appModule = ProjRequire('lib/module/app');
	modules.push(appModule);
	app.get('/app', appModule.list);
	app.post('/app', appModule.create);
	app.get('/app/:name', appModule.item);
	app.put('/app/:name', appModule.update);
	app.delete('/app/:name', appModule.remove);
	app.post('/app/:name/duplicate', appModule.duplicate);
	
	var flowModule = ProjRequire('lib/module/flow');
	modules.push(flowModule);
	app.get('/app/:name/flow', flowModule.list);
	app.post('/app/:name/flow', flowModule.create);
	app.put('/app/:name/flow', flowModule.update);
	app.get('/app/:name/flow/:flowName', flowModule.getSingle);
	app.put('/app/:name/flow/:flowName', flowModule.updateSingle);
	app.delete('/app/:name/flow/:flowName', flowModule.deleteSingle);
	
	var listenerModule = ProjRequire('lib/module/listener');
	modules.push(listenerModule);
	app.get('/app/:name/listener', listenerModule.list);
	app.post('/app/:name/listener', listenerModule.create);
	app.get('/app/:name/listener/:id', listenerModule.getSingle);
	app.put('/app/:name/listener/:id', listenerModule.update);
	app.delete('/app/:name/listener/:id', listenerModule.remove);
	
	var instanceModule = ProjRequire('lib/module/instance');
	modules.push(instanceModule);
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
	
	var backupModule = ProjRequire('lib/module/backup');
	modules.push(backupModule);
	app.get('/backup/export', backupModule.exportData);
	app.post('/backup/import', backupModule.importData);
	
	var monitorModule = ProjRequire('lib/module/monitor');
	modules.push(monitorModule);
	app.get('/monitor/info', monitorModule.info);
	app.get('/monitor/realtime', monitorModule.realtime);
	
	var dbtype = 'memory';
	if(typeof serverOpts.dbtype != 'undefined') {
		var fields = ['dbtype', 'dbhost','dbuser','dbpass','dbname'];
		var dbcfg = {};
		for(var i in fields) {
			var field = fields[i];
			dbcfg[field] = serverOpts[field];
		}
		for(var j in modules) {
			modules[j]._dataStore = new DataStore(dbcfg);
		}
		dbtype = dbcfg['dbtype'];
	}
	app.post('/datasource', function(req, res) {
		var fields = ['dbtype', 'dbhost','dbuser','dbpass','dbname'];
		var dbcfg = {};
		for(var i in fields) {
			var field = fields[i];
			dbcfg[field] = req.body[field];
		}
		for(var j in modules) {
			modules[j]._dataStore = new DataStore(dbcfg);
		}
		dbtype = dbcfg['dbtype'];
		res.end('0');
	});
	app.get('/datasource', function(req, res) {
		res.json({dbtype:dbtype});
	});
}
module.exports = router;