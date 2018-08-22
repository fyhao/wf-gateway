var DataStoreMemory = ProjRequire('./lib/datastore/datastore-memory.js');
var DataStoreMysql = ProjRequire('./lib/datastore/datastore-mysql.js');
var DataStore = function(dbcfg) {
	if(typeof dbcfg == 'undefined') dbcfg = {dbtype:'memory'};
	if(dbcfg.dbtype == 'memory') {
		return new DataStoreMemory(dbcfg);
	}
	else if(dbcfg.dbtype == 'mysql') {
		return new DataStoreMysql(dbcfg);
	}
	return new DataStoreMemory(dbcfg); // default
};

module.exports = DataStore