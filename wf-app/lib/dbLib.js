var mssql = require('mssql');
var mysql = require('mysql');

module.exports.query = function(opts) {
	_query(opts);
}

var _query = function(opts) {
	var cfg = opts.cfg;
	var type = cfg.type;
	if(typeof type === 'undefined') type = 'mssql';
	if(type === 'mssql') {
		process_mssql(opts);
	}
	else if(type === 'mysql') {
		process_mysql(opts);
	}
	else {
		process.nextTick(opts.checkNext);
	}
}

var process_mssql = function(opts) {
	var ctx = opts.ctx;
	var dbConfig = opts.cfg;
	var sql = opts.sql;
	var rs = opts.recordsets;
	var checkNext = opts.checkNext;
	var sql_list = null;
	if(typeof sql  === 'string') {
		sql_list = [sql];
	}
	else if(typeof sql === 'object' && sql.length) {
		sql_list = sql;
	}
	var connection1 = new mssql.Connection(dbConfig, function(err) {
		if(err) {
			console.log('Error');
			console.log(err);
			process.nextTick(checkNext)
			return
		}
		var sql_list_i = 0;
		var next = function() {
			var i = sql_list[sql_list_i];
			var request = new mssql.Request(connection1);
			console.log('SQL: ' + i);
			request.query(i, function(err, recordset) {
				if(err) {
					console.dir(err); return;
				}
				if(rs && rs.length) {
					recordset.forEach(function(i) {
						rs.forEach(function(j) {
							if(typeof i[j] !== 'undefined' && typeof ctx.vars !== 'undefined') {
								ctx.vars[j] = i[j];
							}
						});
					});
				}
				if(++sql_list_i < sql_list.length) {
					process.nextTick(next);
				}
				else {
					if(checkNext) process.nextTick(checkNext);
				}
			});
		}
		process.nextTick(next);
		
			
	});
}

var process_mysql = function(opts) {
	var ctx = opts.ctx;
	var dbConfig = opts.cfg;
	var sql = opts.sql;
	var rs = opts.recordsets;
	var checkNext = opts.checkNext;
	if(!dbConfig.host && dbConfig.server) dbConfig.host = dbConfig.server;
	var connection = mysql.createConnection(/*{
	  host     : 'localhost',
	  user     : 'me',
	  password : 'secret',
	  database : 'my_db'
	}*/dbConfig);

	connection.connect();

	connection.query(sql, function (error, results, fields) {
		if (error) throw error;
		if(rs && rs.length) {
			results.forEach(function(i) {
				rs.forEach(function(j) {
					if(typeof i[j] !== 'undefined') {
						ctx.vars[j] = i[j];
					}
				});
			});
		}
		process.nextTick(checkNext);
	});

	connection.end();
}