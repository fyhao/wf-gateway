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
			if(typeof flowStore[item.name] != 'undefined') {
				resolve({status:101})
				return;
			}
			dbQuery({sql:'insert into app SET ?',fields:item}, function(ctx) {
				flowStore[item.name] = {};
				listenersStore[item.name] = [];
				resolve({status:0});
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
						delete flowStore[name];
						delete listenersStore[name];
						for(var j = 0; j < appInstanceMappingStore.length; j++) {
							var m = appInstanceMappingStore[j];
							if(m.app == name) {
								appInstanceMappingStore.splice(j,1);
								break;
							}
						}
						resolve();
					});
				}
				else {
					reject({status:100})
				}
			});
			
			
			/*
			var found = false;
			for(var i = 0; i < data.length; i++) {
				if(data[i].name == name) {
					data.splice(i,1);
					delete flowStore[name];
					delete listenersStore[name];
					for(var j = 0; j < appInstanceMappingStore.length; j++) {
						var m = appInstanceMappingStore[j];
						if(m.app == name) {
							appInstanceMappingStore.splice(j,1);
							break;
						}
					}
					resolve();
					found = true;
					break;
				}
			}
			if(!found) {
				reject({status:100})
			}
			*/
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
				flow : listener.flow
			};
			dbQuery({sql:'insert into listener SET ?',fields:item}, function(ctx) {
				dbQuery({sql:'select max(id) as maxid from listener where app = ?', fields:[app]}, function(ctx) {
					var batches = [];
					if(listener.requestParams && listener.requestParams.length) {
						for(var i = 0; i < listener.requestParams.length; i++) {
							var p = listener.requestParams[i];
							batches.push({sql:'insert into listenerRequest SET ',fields:{
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
							batches.push({sql:'insert into listenerHeader SET ',fields:{
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
			batches.push({sql:'update listener set type = ?, endpoint = ?, flow = ? where app = ? and id = ?',fields:[listener.type,listener.endpoint, listener.flow, app, id]});
			batches.push({sql:'delete from listenerRequest where id = ?', fields:[id]});
			batches.push({sql:'delete from listenerHeader where id = ?', fields:[id]});
			if(listener.requestParams && listener.requestParams.length) {
				for(var i = 0; i < listener.requestParams.length; i++) {
					var p = listener.requestParams[i];
					batches.push({sql:'insert into listenerRequest SET ',fields:{
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
					batches.push({sql:'insert into listenerHeader SET ',fields:{
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
			for(var i = 0; i < listenersStore[app].length; i++) {
				if(listenersStore[app][i].id == id) {
					listenersStore[app].splice(i,1);
					break;
				}
			}
			resolve();
		});
	}
	this.getInstances = function(opts) {
		return new Promise(function(resolve,reject) {
			resolve(instancesStore);
		});
	}
	this.createInstance = function(opts) {
		return new Promise(function(resolve,reject) {
			var instance = opts.instance;
			instance.id = ++global_id;
			instancesStore.push(instance);
			resolve(instance);
		});
	}
	this.updateInstance = function(opts) {
		return new Promise(function(resolve,reject) {
			var instance = opts.instance;
			for(var i = 0; i < instancesStore.length; i++) {
				if(instancesStore[i].id == opts.id) {
					for(var j in instance) {
						instancesStore[i][j] = instance[j];
					}
					break;
				}
			}
			resolve();
		});
	}
	this.deleteInstance = function(opts) {
		return new Promise(function(resolve,reject) {
			var id = opts.id;
			for(var i = 0; i < instancesStore.length; i++) {
				if(instancesStore[i].id == id) {
					instancesStore.splice(i,1);
					break;
				}
			}
			resolve();
		});
	}
	this.getInstance = function(opts) {
		return new Promise(function(resolve,reject) {
			var id = opts.id;
			for(var i = 0; i < instancesStore.length; i++) {
				if(instancesStore[i].id == id) {
					resolve(instancesStore[i]);
					return;
				}
			}
			resolve(null);
		});
	}
	this.getInstancesForApp = function(opts) {
		return new Promise(function(resolve,reject) {
			var instance_id = [];
			for(var i = 0; i < appInstanceMappingStore.length; i++) {
				var m = appInstanceMappingStore[i];
				if(m.app == opts.app) {
					instance_id.push(m.instance_id);
				}
			}
			var instances = [];
			for(var i = 0; i < instance_id.length; i++) {
				for(j = 0; j < instancesStore.length; j++) {
					if(instancesStore[j].id == instance_id[i]) {
						instances.push(instancesStore[j]);
					}
				}
			}
			resolve(instances);
		});
	}
	this.createInstanceForApp = function(opts) {
		return new Promise(function(resolve,reject) {
			for(var i = 0; i < appInstanceMappingStore.length; i++) {
				var m = appInstanceMappingStore[i];
				if(m.app == opts.app && m.instance_id == opts.id) {
					resolve(101);
					return;
				}
			}
			appInstanceMappingStore.push({app:opts.app,instance_id:opts.id,status:'disabled'});
			resolve(0);
		});
	}
	this.deleteInstanceForApp = function(opts) {
		return new Promise(function(resolve,reject) {
			var isDeleted = false;
			for(var i = 0; i < appInstanceMappingStore.length; i++) {
				var m = appInstanceMappingStore[i];
				if(m.app == opts.app && m.instance_id == opts.id) {
					appInstanceMappingStore.splice(i,1);
					isDeleted = true;
				}
			}
			resolve(isDeleted ? 0 : 102);
		});
	}
	this.getAppsForInstance = function(opts) {
		return new Promise(function(resolve,reject) {
			var apps = [];
			for(var i = 0; i < appInstanceMappingStore.length; i++) {
				var m = appInstanceMappingStore[i];
				if(m.instance_id == opts.id) {
					apps.push({app:m.app,status:m.status});
				}
			}
			resolve(apps);
		});
	}
	this.actionAppForInstance = function(opts) {
		return new Promise(function(resolve,reject) {
			for(var i = 0; i < appInstanceMappingStore.length; i++) {
				var m = appInstanceMappingStore[i];
				if(m.app == opts.app && m.instance_id == opts.id) {
					m.status = opts.action == 'enable' ? 'enabled' : 'disabled';
				}
			}
			resolve();
		});
	}
	this.exportData = function() {
		return new Promise(function(resolve,reject) {
			var result = {};
			result.appData = data;
			result.flowData = flowStore;
			result.listenerData = listenersStore;
			result.instanceData = instancesStore;
			result.appInstanceMappingData = appInstanceMappingStore;
			result.global_id = global_id;
			resolve(result);
		});
	}
	this.importData = function(opts) {
		return new Promise(function(resolve,reject) {
			try {
				var input = JSON.parse(opts.input);
				data = input.appData;
				flowStore = input.flowData;
				listenersStore = input.listenerData;
				instancesStore = input.instanceData;
				appInstanceMappingStore = input.appInstanceMappingData;
				global_id = input.global_id;
				resolve(0);
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