var dbLib = ProjRequire('./lib/dbLib.js');
var DataStoreMysql = function(dbcfg) {
	var dbQuery = function(opts, fn) {
		var ctx = {vars:{}};
		dbLib.query({
			ctx : ctx,
			cfg : {
				type:'mysql',
				host     : dbcfg.dbhost,
				user     : dbcfg.dbuser,
				password : dbcfg.dbpass,
				database : dbcfg.dbname,
				multipleStatements: true
			},
			sql : opts.sql,
			fields : opts.fields,
			recordSets : opts.recordSets,
			checkNext : function() {
				fn(ctx);
			}
		});
	}
	var dbBatchQuery = function(batches, fn) {
		var c = 0;
		var batchedResults = [];
		console.log(batches)
		var next = function() {
			if(c >= batches.length) {
				fn(batchedResults);
			}
			else {
				dbQuery(batches[c], function(ctx) {
					batchedResults.push(ctx);
					++c;
					next();
				});
			}
		}
		next();
	}
	this.getAppList = function(entity) {
		return new Promise(function(resolve, reject) {
			dbQuery({sql:'select * from app'}, function(ctx) {
				resolve(ctx.results)
			});
		})
	}
	this.createApp = function(item) {
		return new Promise(function(resolve,reject){
			dbQuery({sql:'select * from app where name = ?', fields:[item.name]}, function(ctx) {
				if(ctx.results.length) {
					resolve({status:101})
				}
				else {
					dbQuery({sql:'insert into app SET ?',fields:item}, function(ctx) {
						resolve({status:0});
					});
				}
			});
		});
		
	}
	this.getApp = function(name) {
		return new Promise(function(resolve, reject) {
			dbQuery({sql:'select * from app where name = ?',fields:[name]}, function(ctx) {
				if(ctx.results.length) {
					resolve(ctx.results[0]);
				}
				else {
					reject({status:100})
				}
			});
		})
	}
	this.updateApp = function(name, fields) {
		return new Promise(function(resolve, reject) {
			dbQuery({sql:'update app set description = ? where name = ?', fields:[fields.description,name]}, function(ctx) {
				dbQuery({sql:'select * from app where name = ?',fields:[name]}, function(ctx) {
					if(ctx.results.length) {
						resolve(ctx.results[0]);
					}
					else {
						reject({status:100})
					}
				});
			});
		})
	}
	this.deleteApp = function(name, fields) {
		return new Promise(function(resolve, reject) {
			dbQuery({sql:'select * from app where name = ?',fields:[name]}, function(ctx) {
				if(ctx.results.length) {
					dbQuery({sql:'delete from app where name = ?',fields:[name]}, function(ctx) {
						
						var batches = [];
						batches.push({sql:'delete from flow where app = ?', fields:[name]});
						batches.push({sql:'delete from listener where app = ?', fields:[name]});
						batches.push({sql:'delete from appInstanceMapping where app = ?', fields:[name]});
						dbBatchQuery(batches, function(ctxs) {
							resolve();
						});
					});
				}
				else {
					reject({status:100})
				}
			});
		})
	}
	this.getFlows = function(opts) {
		return new Promise(function(resolve,reject) {
			dbQuery({sql:'select * from flow where app = ?',fields:[opts.app]}, function(ctx) {
				var flows = {};
				if(ctx.results.length) {
					for(var i = 0; i < ctx.results.length; i++) {
						flows[ctx.results[i]['name']] = JSON.parse(ctx.results[i]['content']);
					}
				}
				resolve(flows);
			});
		});
	}
	this.createFlow = function(opts) {
		return new Promise(function(resolve,reject) {
			var items = [];
			for(var i in opts.flows) {
				items.push({app:opts.app,name:i,content:JSON.stringify(opts.flows[i])});
			}
			var c = 0;
			var next = function() {
				if(c >= items.length) {
					resolve();
				}
				else {
					dbQuery({sql:'insert into flow SET ?',fields:items[c]}, function(ctx) {
						++c;
						next();
					});
				}
			}
			next();
		});
	}
	this.updateFlow = function(opts) {
		return new Promise(function(resolve,reject) {
			var items = [];
			for(var i in opts.flows) {
				items.push([i, JSON.stringify(opts.flows[i]), opts.app]);
			}
			var c = 0;
			var next = function() {
				if(c >= items.length) {
					resolve();
				}
				else {
					dbQuery({sql:'update flow set name = ?, content = ? where app = ?',fields:items[c]}, function(ctx) {
						++c;
						next();
					});
				}
			}
			next();
		});
	}
	this.updateEntireFlow = function(opts) {
		return new Promise(function(resolve,reject) {
			dbQuery({sql:'delete from flow where app = ?',fields:[opts.app]}, function(ctx) {
				var items = [];
				for(var i in opts.flows) {
					items.push({app:opts.app,name:i,content:JSON.stringify(opts.flows[i])});
				}
				var c = 0;
				var next = function() {
					if(c >= items.length) {
						resolve();
					}
					else {
						dbQuery({sql:'insert into flow SET ?',fields:items[c]}, function(ctx) {
							++c;
							next();
						});
					}
				}
				next();
			});
		});
	}
	this.deleteFlow = function(opts) {
		return new Promise(function(resolve,reject) {
			dbQuery({sql:'delete from flow where app = ? and name = ?',fields:[opts.app, opts.flowName]}, function(ctx) {
				resolve();
			});
		});
	}
	this.getListeners = function(opts) {
		return new Promise(function(resolve,reject) {
			dbQuery({sql:'select * from listener where app = ?',fields:[opts.app]}, function(ctx) {
				resolve(ctx.results);
			});
		});
	}
	this.getListener = function(opts) {
		return new Promise(function(resolve,reject) {
			dbQuery({sql:'select * from listener where app = ? and id = ?',fields:[opts.app,opts.id]}, function(ctx) {
				if(ctx.results.length) {
					resolve(ctx.results[0]);
				}
				else {
					resolve(null);
				}
			});
		});
	}
	this.createListener = function(opts) {
		return new Promise(function(resolve,reject) {
			var app = opts.app;
			var listener = opts.listener;
			var item = {
				app : app,
				type : listener.type,
				endpoint : listener.endpoint,
				method : listener.method,
				flow : listener.flow
			};
			dbQuery({sql:'insert into listener SET ?',fields:item}, function(ctx) {
				dbQuery({sql:'select max(id) as maxid from listener where app = ?', fields:[app]}, function(ctx) {
					var batches = [];
					if(listener.requestParams && listener.requestParams.length) {
						for(var i = 0; i < listener.requestParams.length; i++) {
							var p = listener.requestParams[i];
							console.log(p)
							console.log(ctx.results[0]['maxid'])
							batches.push({sql:'insert into listenerRequest SET ?',fields:{
								id:ctx.results[0]['maxid'],
								name:p.name,
								conditions:p.condition,
								type:p.type,
								defaultValue:p.defaultValue,
								description:p.description
							}});
						}
					}
					if(listener.requestHeaders && listener.requestHeaders.length) {
						for(var i = 0; i < listener.requestHeaders.length; i++) {
							var p = listener.requestHeaders[i];
							batches.push({sql:'insert into listenerHeader SET ?',fields:{
								id:ctx.results[0]['maxid'],
								name:p.name,
								conditions:p.condition,
								type:p.type,
								defaultValue:p.defaultValue,
								description:p.description
							}});
						}
					}
					dbBatchQuery(batches, function(ctxs) {
						resolve(listener);
					});
				})
				
			});
		});
	}
	this.updateListener = function(opts) {
		return new Promise(function(resolve,reject) {
			var app = opts.app;
			var listener = opts.listener;
			var id = opts.id;
			var batches = [];
			var fieldstr = '';
			var fieldcomma = '';
			var fields = [];
			for(var field in listener) {
				fieldstr += fieldcomma;
				fieldstr += field + ' = ?';
				fieldcomma = ',';
				fields.push(listener[field]);
			}
			fields.push(app);
			fields.push(id);
			batches.push({sql:'update listener set ' + fieldstr + ' where app = ? and id = ?',fields:fields});
			batches.push({sql:'delete from listenerRequest where id = ?', fields:[id]});
			batches.push({sql:'delete from listenerHeader where id = ?', fields:[id]});
			if(listener.requestParams && listener.requestParams.length) {
				for(var i = 0; i < listener.requestParams.length; i++) {
					var p = listener.requestParams[i];
					batches.push({sql:'insert into listenerRequest SET ?',fields:{
						id:id,
						name:p.name,
						conditions:p.condition,
						type:p.type,
						defaultValue:p.defaultValue,
						description:p.description
					}});
				}
			}
			if(listener.requestHeaders && listener.requestHeaders.length) {
				for(var i = 0; i < listener.requestHeaders.length; i++) {
					var p = listener.requestHeaders[i];
					batches.push({sql:'insert into listenerHeader SET ?',fields:{
						id:id,
						name:p.name,
						conditions:p.condition,
						type:p.type,
						defaultValue:p.defaultValue,
						description:p.description
					}});
				}
			}
			dbBatchQuery(batches, function(ctxs) {
				resolve();
			});
		});
	}
	this.deleteListener = function(opts) {
		return new Promise(function(resolve,reject) {
			var app = opts.app;
			var listener = opts.listener;
			var id = opts.id;
			var batches = [];
			batches.push({sql:'delete from listenerRequest where id = ?', fields:[id]});
			batches.push({sql:'delete from listenerHeader where id = ?', fields:[id]});
			batches.push({sql:'delete from listener where app = ? and id = ?', fields:[app, id]});
			dbBatchQuery(batches, function(ctxs) {
				resolve();
			});
		});
	}
	this.getInstances = function(opts) {
		return new Promise(function(resolve,reject) {
			dbQuery({sql:'select * from instance',fields:[]}, function(ctx) {
				resolve(ctx.results);
			});
		});
	}
	this.createInstance = function(opts) {
		return new Promise(function(resolve,reject) {
			var instance = opts.instance;
			dbQuery({sql:'insert into instance SET ?', fields:{name:instance.name, description:instance.description, host:instance.host}}, function(ctx) {
				dbQuery({sql:'select max(id) as maxid from instance;'}, function(ctx) {
					instance.id = ctx.results[0].maxid;
					resolve(instance);
				});
			});
		});
	}
	this.updateInstance = function(opts) {
		return new Promise(function(resolve,reject) {
			var instance = opts.instance;
			var fieldstr = '';
			var fieldcomma = '';
			var fields = [];
			for(var field in instance) {
				fieldstr += fieldcomma;
				fieldstr += field + ' = ?';
				fieldcomma = ',';
				fields.push(instance[field]);
			}
			fields.push(opts.id);
			dbQuery({sql:'update instance set ' + fieldstr + ' where id = ?', fields:fields}, function(ctx) {
				resolve();
			});
		});
	}
	this.deleteInstance = function(opts) {
		return new Promise(function(resolve,reject) {
			var id = opts.id;
			var batches = [];
			batches.push({sql:'delete from appInstanceMapping where instance_id = ?',fields:[id]});
			batches.push({sql:'delete from instance where id = ?',fields:[id]});
			dbBatchQuery(batches, function(ctxs) {
				resolve();
			});
		});
	}
	this.getInstance = function(opts) {
		return new Promise(function(resolve,reject) {
			var id = opts.id;
			dbQuery({sql:'select * from instance where id = ?', fields:[id]}, function(ctx) {
				if(ctx.results.length)
					resolve(ctx.results[0]);
				else
					resolve(null);
			});
		});
	}
	this.getInstancesForApp = function(opts) {
		return new Promise(function(resolve,reject) {
			dbQuery({sql:'select instance_id from appInstanceMapping where app = ?', fields:[opts.app]}, function(ctx) {
				var instances = [];
				if(ctx.results.length) {
					var batches = [];
					for(var i = 0; i < ctx.results.length; i++) {
						batches.push({sql:'select * from instance where id = ?', fields:[ctx.results[i].instance_id]});
					}
					dbBatchQuery(batches, function(ctxs) {
						if(ctxs.length) {
							for(var i = 0; i < ctxs.length; i++) {
								instances.push(ctxs[i].results[0])
							}
						}
						resolve(instances);
					});	
				}
				else {
					resolve(instances);
				}
			});
		});
	}
	this.createInstanceForApp = function(opts) {
		return new Promise(function(resolve,reject) {
			dbQuery({sql:'select instance_id from appInstanceMapping where app = ? and instance_id = ?', fields:[opts.app,opts.id]}, function(ctx) {
				if(ctx.results.length) {
					resolve(101);
				}
				else {
					dbQuery({sql:'insert into appInstanceMapping SET ?', fields:{app:opts.app,instance_id:opts.id,status:'disabled'}}, function(ctx) {
						resolve(0);
					});
				}
			});
		});
	}
	this.deleteInstanceForApp = function(opts) {
		return new Promise(function(resolve,reject) {
			dbQuery({sql:'select instance_id from appInstanceMapping where app = ? and instance_id = ?', fields:[opts.app,opts.id]}, function(ctx) {
				if(ctx.results.length) {
					dbQuery({sql:'delete from appInstanceMapping where app = ? and instance_id = ?', fields:[opts.app,opts.id]}, function(ctx) {
						resolve(0);
					});
				}
				else {
					resolve(102);
				}
			});
		});
	}
	this.getAppsForInstance = function(opts) {
		return new Promise(function(resolve,reject) {
			var apps = [];
			dbQuery({sql:'select * from appInstanceMapping where instance_id = ?', fields:[opts.id]}, function(ctx) {
				if(ctx.results.length) {
					for(var i = 0; i < ctx.results.length; i++) {
						apps.push({app:ctx.results[i].app,status:ctx.results[i].status});
					}
				}
				resolve(apps);
			});
		});
	}
	this.actionAppForInstance = function(opts) {
		return new Promise(function(resolve,reject) {
			var status = opts.action == 'enable' ? 'enabled' : 'disabled';
			dbQuery({sql:'update appInstanceMapping set status = ? where app = ? and instance_id = ?', fields:[status,opts.app,opts.id]}, function(ctx) {
				resolve();
			});
		});
	}
	this.exportData = function() {
		return new Promise(function(resolve,reject) {
			var result = {};
			var batches = [];
			batches.push({sql:'select * from app'});
			batches.push({sql:'select * from flow'});
			batches.push({sql:'select * from listener'});
			batches.push({sql:'select * from instance'});
			batches.push({sql:'select * from appInstanceMapping'});
			batches.push({sql:'select max(id) as maxid from listener'});
			batches.push({sql:'select max(id) as maxid from instance'});
			dbBatchQuery(batches, function(ctxs) {
				result.appData = ctxs[0].results;
				var i = 0;
				result.flowData = {};
				for(i = 0; i < ctxs[1].results.length; i++) {
					if(typeof result.flowData[ctxs[1].results[i].app] == 'undefined') {
						result.flowData[ctxs[1].results[i].app] = {};
					}
					result.flowData[ctxs[1].results[i].app][ctxs[1].results[i].name] = JSON.parse(ctxs[1].results[i].content);
				}
				result.listenerData = {};
				for(i = 0; i < ctxs[2].results.length; i++) {
					if(typeof result.listenerData[ctxs[2].results[i].app] == 'undefined') {
						result.listenerData[ctxs[2].results[i].app] = [];
					}
					var temp = ctxs[2].results[i];
					result.listenerData[ctxs[2].results[i].app] = temp;
					// PENDING for listenerRequest & listenerResponse
				}
				result.instanceData = ctxs[3].results;
				result.appInstanceMappingData = ctxs[4].results;
				var max1 = ctxs[5].results[0].maxid;
				var max2 = ctxs[6].results[0].maxid;
				var max = 0;
				max = Math.max(max,max1);
				max = Math.max(max,max2);
				result.global_id = max;
				resolve(result);
			});
		});
	}
	this.importData = function(opts) {
		return new Promise(function(resolve,reject) {
			try {
				var input = JSON.parse(opts.input);
				var batches = [];
				batches.push({sql:'delete from app'});
				for(var i = 0; i < input.appData.length; i++) {
					batches.push({sql:'insert into app SET ?', fields:input.appData[i]});
				}
				batches.push({sql:'delete from flow'});
				for(var app in input.flowData) {
					for(var flowName in input.flowData[app]) {
						batches.push({sql:'insert into flow SET ?', fields:{app:app,name:flowName,content:JSON.stringify(input.flowData[app][flowName])}});
					}
				}
				batches.push({sql:'delete from listener'});
				for(var app in input.listenerData) {
					for(var i = 0; i < input.listenerData[app].length; i++) {
						input.listenerData[app][i].app = app;
					}
					batches.push({sql:'insert into listener SET ?', fields:input.listenerData[app]});
				}
				batches.push({sql:'delete from instance'});
				for(var i = 0; i < input.instanceData.length; i++) {
					batches.push({sql:'insert into instance SET ?', fields:input.instanceData[i]});
				}
				batches.push({sql:'delete from appInstanceMapping'});
				for(var i = 0; i < input.appInstanceMappingData.length; i++) {
					batches.push({sql:'insert into appInstanceMapping SET ?', fields:input.appInstanceMappingData[i]});
				}
				dbBatchQuery(batches, function(ctxs) {
					resolve(0);
				});
			} catch (e) {
				resolve(1);
			}
		});
	}
	this.getMonitorHistoricalData = function(opts) {
		return new Promise(function(resolve,reject) {
			var limit = opts.limit;
			var result = [];
			for(var i = 0; i < monHistoryStore.length; i++) {
				result.push(monHistoryStore[i]);
			}
			result = result.reverse().slice(0, limit);
			resolve(result);
		});
	}
	this.clearMonitorHistoricalData = function(opts) {
		return new Promise(function(resolve,reject) {
			monHistoryStore = [];
			resolve(0);
		});
	}
	this.addMonitorHistoricalData = function(opts) {
		return new Promise(function(resolve,reject) {
			var item = opts.item;
			monHistoryStore.push(item);
			resolve(0);
		});
	}
	this.getMonitorRealtimeData = function(opts) {
		return new Promise(function(resolve,reject) {
			resolve(monRealtimeStore);
		});
	}
	this.updateMonitorRealtimeData = function(opts) {
		return new Promise(function(resolve,reject) {
			var item = opts.item;
			monRealtimeStore = item;
			resolve(0);
		});
	}
}
var data = [];
var flowStore = {};
var listenersStore = {};
var instancesStore = [];
var appInstanceMappingStore = []; // app name and instance id mapping
var monHistoryStore = [];
var monRealtimeStore = {};
var global_id = 0;
module.exports = DataStoreMysql