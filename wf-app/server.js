function createServer(opts) {
	if(typeof opts == 'undefined') opts = {};
	var port = 8081; // default port
	if(typeof opts['port'] != 'undefined') port = opts['port'];
	const express = require('express')
	const bodyParser = require('body-parser');
	const app = express()
	const uploadOptions = { directory: opts.uploadDirectory || process.env.WF_UPLOAD_DIR, maxBytes: opts.uploadMaxBytes || 5 * 1024 * 1024 };
	app.use(express.raw({ type: 'application/octet-stream', limit: uploadOptions.maxBytes }));
	app.use((req, res, next) => { req.uploadOptions = uploadOptions; next(); });
	app.use(bodyParser.urlencoded({ extended: true }))
	app.use(bodyParser.json())

	var path = require('path');
	global.ProjRequire = function(module) {
		return require(path.join(__dirname, '/' + module)); 
	}
	app.get('/', (req, res) => res.send('Hello World!'))

	const router = ProjRequire('./lib/router');
	router(app, opts);

	app.use((err, req, res, next) => res.status(err.status || 500).json({error: err.status === 413 ? 'UPLOAD_TOO_LARGE' : 'REQUEST_FAILED'}));
	var server = app.listen(port, () => console.log('wf-app server listening on port ' + port + '!'))
	server.on('close', () => require('./lib/cronManager').clearJobs());
	return server;

}

module.exports = createServer;