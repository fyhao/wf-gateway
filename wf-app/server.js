function createServer(opts) {
	if(typeof opts == 'undefined') opts = {};
	var port = 8081; // default port
	if(typeof opts['port'] != 'undefined') port = opts['port'];
	const express = require('express')
	const bodyParser = require('body-parser');
	const app = express()
	app.use(bodyParser.urlencoded({ extended: true }))
	app.use(bodyParser.json())

	var path = require('path');
	global.ProjRequire = function(module) {
		return require(path.join(__dirname, '/' + module)); 
	}
	app.get('/', (req, res) => res.send('Hello World!'))

	const router = ProjRequire('./lib/router');
	router(app);

	var server = app.listen(port, () => console.log('wf-app server listening on port ' + port + '!'))
	return server;

}

module.exports = createServer;