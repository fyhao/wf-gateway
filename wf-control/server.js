function createServer(opts) {
	if(typeof opts == 'undefined') opts = {};
	var port = 8080; // default port
	if(typeof opts['port'] != 'undefined') port = opts['port'];
	const express = require('express')
	const bodyParser = require('body-parser');
	const app = express()
	app.use(bodyParser.urlencoded({ extended: true }))
	app.use(bodyParser.json())
	app.use(function(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Methods", "*");
	  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	  next();
	});
	app.options('*', (req, res) => res.sendStatus(204));
	require('./lib/auth').install(app, opts.auth);
	var path = require('path');
	global.ProjRequire = function(module) {
		return require(path.join(__dirname, '/' + module)); 
	}
	app.get('/', (req, res) => res.send('Hello World!'))

	const router = ProjRequire('./lib/router');
	router(app, opts);

	var server = app.listen(port, () => console.log('wf-control server listening on port ' + port + '!'))
	return server;

}

module.exports = createServer;