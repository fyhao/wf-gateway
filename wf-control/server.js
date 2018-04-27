function createServer() {
	const express = require('express')
	const app = express()
	var path = require('path');
	global.ProjRequire = function(module) {
		return require(path.join(__dirname, '/' + module)); 
	}
	app.get('/', (req, res) => res.send('Hello World!'))

	const router = ProjRequire('./lib/router');
	router(app);

	var server = app.listen(8080, () => console.log('Example app listening on port 8080!'))
	return server;

}

module.exports = createServer;