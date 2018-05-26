function createServer() {
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

	var server = app.listen(8081, () => console.log('Example app listening on port 8081!'))
	return server;

}

module.exports = createServer;