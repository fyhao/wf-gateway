var path = require('path');
global.ProjRequire = function(module) {
	return require(path.join(__dirname, '/../' + module)); 
}
require('./testmain.js');
require('./testServlet.js');
require('./testDbLib.js');
