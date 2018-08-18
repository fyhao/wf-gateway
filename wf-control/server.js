function createServer(opts) {
	if(typeof opts == 'undefined') opts = {};
	var port = 8080; // default port
	if(typeof opts['port'] != 'undefined') port = opts['port'];
	const express = require('express')
	const bodyParser = require('body-parser');
	const app = express()
	app.use(bodyParser.urlencoded({ extended: true }))
	app.use(bodyParser.json())
	app.use(function timeLog (req, res, next) {
	  if(req.method == 'OPTIONS') {
		  next();
		  return;
	  }
	  console.log('start request------------------------------');
	  console.log('req.originalUrl: ' + req.originalUrl);
	  console.log('req.method:'+req.method)
	  console.log('req.params: ' + JSON.stringify(req.params));
	  console.log('req.body: ' + JSON.stringify(req.body));
	  console.log('req.query: ' + JSON.stringify(req.query));
	 
	  next()
	  var oldSend = res.send;
	  res.send = function(data){
			// arguments[0] (or `data`) contains the response body
			console.log('res: ' + arguments[0])
			oldSend.apply(res, arguments);
		}
	  console.log('end request-------------------------------');
	})
	app.use(function(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Methods", "*");
	  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	  next();
	});
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