var DataStoreMemory = ProjRequire('./lib/datastore/datastore-memory.js');
var DataStoreMysql = ProjRequire('./lib/datastore/datastore-mysql.js');
var DataStore = function(dbcfg) {
	if(typeof dbcfg == 'undefined') dbcfg = {type:'memory'};
	if(dbcfg.type == 'memory') {
		return new DataStoreMemory(dbcfg);
	}
	else if(dbcfg.type == 'mysql') {
		return new DataStoreMysql(dbcfg);
	}
	return new DataStoreMemory(dbcfg); // default
};

module.exports = DataStore