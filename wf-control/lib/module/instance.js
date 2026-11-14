var DataStore = ProjRequire('./lib/data-store.js');
var unirest = require('../http-client');
var mod = {
	_dataStore : new DataStore(),
	list : function(req, res) {
		mod._dataStore.getInstances().then(function(result) {
			res.json({status:0,instances:result});
		});
	},
	create : function(req, res) {
		var instance = {
			name : req.body.name,
			description : req.body.description,
			host : req.body.host,
			monHistory : 'true',
			monRealtime : 'true'
		};
		mod._dataStore.createInstance({instance:instance}).then(function(result) {
			res.json({status:0, instance:result});
		});
	},
	update : function(req, res) {
		var instance = {
			name : req.body.name,
			description : req.body.description,
			host : req.body.host,
			monHistory: req.body.monHistory,
			monRealtime: req.body.monRealtime
		};
		var id = req.params.id;
		mod._dataStore.updateInstance({instance:instance,id:id}).then(function(result) {
			res.json({status:0});
		});
	},
	remove : function(req, res) {
		var id = req.params.id;
		mod._dataStore.deleteInstance({id:id}).then(function(result) {
			res.json({status:0});
		});
	},
	getSingle : function(req, res) {
		var id = req.params.id;
		mod._dataStore.getInstance({id:id}).then(function(result) {
			res.json({status:0,instance:result});
		});
	},
	listForApp : function(req, res) {
		var name = req.params.name;
		mod._dataStore.getInstancesForApp({app:name}).then(function(result) {
			res.json({status:0, instances:result});
		})
	},
	createForApp : function(req, res) {
		var name = req.params.name;
		var id = req.params.id;
		mod._dataStore.createInstanceForApp({app:name,id:id}).then(function(status) {
			res.json({status:status});
		})
	},
	deleteForApp : function(req, res) {
		var name = req.params.name;
		var id = req.params.id;
		mod._dataStore.deleteInstanceForApp({app:name,id:id}).then(function(status) {
			res.json({status:status});
		})
	},
	listAppForInstance : function(req, res) {
		var id = req.params.id;
		mod._dataStore.getAppsForInstance({id:id}).then(function(result) {
			res.json({status:0,apps:result});
		});
	},
	actionAppForInstance : function(req, res) {
		var id = req.params.id;
		var name = req.params.name;
		var action = req.params.action;
		mod._dataStore.actionAppForInstance({app:name,id:id,action:action}).then(function(result) {
			res.json({status:0});
		});
	},
	logs : function(req, res) {
        mod._dataStore.getInstance({id:req.params.id}).then(function(instance) {
            if (!instance) return res.status(404).json({error:'INSTANCE_NOT_FOUND'});
            var call = unirest.get(instance.host + '/control/logs').timeout(5000).query({limit:Math.max(1, Math.min(1000, Number(req.query.limit) || 100)), app:req.query.app || ''});
            if (process.env.WF_RUNTIME_TOKEN) call.header('Authorization', 'Bearer ' + process.env.WF_RUNTIME_TOKEN);
            call.end(function(response) {
                if (response.error || response.status !== 200) return res.status(502).json({error:'INSTANCE_LOGS_UNAVAILABLE'});
                res.json(response.body);
            });
        }).catch(function() { res.status(500).json({error:'INSTANCE_LOOKUP_FAILED'}); });
    },
	deploy : function(req, res) {
        mod._dataStore.getInstance({id:req.params.id}).then(function(instance) {
            return checkConf({instance:instance, conf:req.body.conf});
        }).then(sendConfToInstance).then(function(ret) { res.json(ret); })
          .catch(function(err) { res.status(err.status || 400).json({status:1, error:err.message}); });
    }
};
async function checkConf(opts) {
    if (!opts.instance) throw new Error('Instance not found');
    if (!opts.conf || typeof opts.conf.action !== 'string') throw new Error('Missing deployment action');
    const conf = opts.conf;
    const apps = await mod._dataStore.getAppsForInstance({id:opts.instance.id});
    if (conf.action === 'deployAll') {
        conf.apps = await Promise.all(apps.map(async item => ({
            app:item.app, status:item.status,
            flows:await mod._dataStore.getFlows({app:item.app}),
            listeners:await mod._dataStore.getListeners({app:item.app})
        })));
    } else if (['deployAppStatus','deployAppFlow','deployAppFlows','deployApp'].includes(conf.action)) {
        const item = apps.find(item => item.app === conf.app);
        if (!item) throw new Error('App not assigned to instance');
        if (conf.action === 'deployAppStatus') conf.status = item.status;
        else {
            const flows = await mod._dataStore.getFlows({app:conf.app});
            if (conf.action === 'deployAppFlow') {
                if (!flows[conf.flow]) throw new Error('Flow not found');
                conf.flowObj = flows[conf.flow];
            } else conf.flows = flows;
            if (conf.action === 'deployApp') conf.listeners = await mod._dataStore.getListeners({app:conf.app});
        }
    }
    return opts;
}
function sendConfToInstance(opts) {
    return new Promise(function(resolve, reject) {
        const call = unirest.post(opts.instance.host + '/control/deploy').timeout(15000)
            .headers(process.env.WF_RUNTIME_TOKEN ? {Authorization:'Bearer ' + process.env.WF_RUNTIME_TOKEN} : {})
            .send({conf:JSON.stringify(opts.conf)});
        call.end(function(response) {
            if (response.error || response.status !== 200 || !response.body || response.body.status !== 0) {
                const err = new Error('Runtime deployment failed'); err.status = 502; return reject(err);
            }
            resolve({status:0, appResponse:response.body});
        });
    });
}
module.exports = mod;
