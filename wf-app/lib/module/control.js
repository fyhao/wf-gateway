'use strict';
const express = require('express');
const DataStore = ProjRequire('./lib/data-store.js');
const modServlet = ProjRequire('./lib/module/engine/modServlet');
const modFlow = ProjRequire('./lib/module/engine/modFlow');
const cronManager = ProjRequire('lib/cronManager');
const dataStore = new DataStore();
const lifecycleTypes = ['deploy.init', 'deploy.done', 'app.init', 'app.destroy', 'app_init'];
let registeredApps = [];
let runtimeRouter = express.Router();
let pending = Promise.resolve();
const eventMgr = { trigger: function() {} };

function validate(apps) {
  if (!Array.isArray(apps)) throw new Error('apps must be an array');
  const names = new Set();
  const routes = new Set();
  apps.forEach(item => {
    if (!item || typeof item.app !== 'string' || names.has(item.app) || !item.flows || typeof item.flows !== 'object' || !Array.isArray(item.listeners)) throw new Error('Invalid or duplicate app');
    if (!['enabled','disabled'].includes(item.status) || Array.isArray(item.flows)) throw new Error('Invalid app status or flows');
    Object.keys(item.flows).forEach(name => {
      const flow = item.flows[name];
      if (!flow || !Array.isArray(flow.steps) || flow.steps.some(step => !step || typeof step.type !== 'string')) throw new Error('Invalid workflow definition');
    });
    names.add(item.app);
    item.listeners.forEach(listener => {
      if (!listener || !Object.prototype.hasOwnProperty.call(item.flows, listener.flow)) throw new Error('Listener flow does not exist');
      if (listener.type === 'http') {
        const method = (listener.method || 'GET').toLowerCase();
        if (!['get', 'post', 'put', 'delete'].includes(method) || typeof listener.endpoint !== 'string' || !listener.endpoint.startsWith('/') || /^\/control(?:\/|$)/i.test(listener.endpoint)) throw new Error('Invalid HTTP listener');
        const key = method + ':' + listener.endpoint;
        if (item.status === 'enabled' && routes.has(key)) throw new Error('Duplicate HTTP route');
        if (item.status === 'enabled') routes.add(key);
      } else if (listener.type !== 'cron' && !lifecycleTypes.includes(listener.type)) throw new Error('Unknown listener type');
    });
  });
}
function buildRouter(apps) {
  const router = express.Router();
  apps.filter(a => a.status === 'enabled').forEach(item => item.listeners.filter(l => l.type === 'http').forEach(listener => {
    router[(listener.method || 'GET').toLowerCase()](listener.endpoint, modServlet.createHandler(eventMgr, item, listener));
  }));
  return router;
}
function triggerFlow(item, flow, event) {
  return new Promise((resolve, reject) => {
    const ctx = { app: item.app, flow, flows: item.flows, vars: { lifecycleEvent: event }, _logs: [], props: {}, FLOW_ENGINE_CANCELED_notification_queues: [] };
    ctx.enable_FLOW_ENGINE_CANCELLED = () => ctx.FLOW_ENGINE_CANCELED_notification_queues.forEach(fn => fn());
    ctx.createFlowEngine = name => new modFlow.FlowEngine(typeof name === 'string' ? ctx.flows[name] : name).setContext(ctx);
    const timer = setTimeout(() => { ctx.enable_FLOW_ENGINE_CANCELLED(); reject(new Error('Lifecycle flow timed out')); }, 5000);
    ctx.createFlowEngine(flow).execute(() => {
      clearTimeout(timer);
      if (ctx._error) reject(ctx._error); else resolve();
    });
  });
}
async function lifecycle(items, event) {
  for (const item of items.filter(a => a.status === 'enabled')) {
    for (const listener of item.listeners) {
      if (listener.type === event || (event === 'app.init' && listener.type === 'app_init')) await triggerFlow(item, listener.flow, event);
    }
  }
}
async function deploy(conf) {
  let apps = JSON.parse(JSON.stringify(registeredApps));
  const action = conf.action;
  if (action === 'deployAll') apps = conf.apps;
  else {
    const item = apps.find(a => a.app === conf.app);
    if (!item) throw new Error('App is not deployed');
    if (action === 'deployAppStatus') {
      if (!['enabled', 'disabled'].includes(conf.status)) throw new Error('Invalid app status');
      item.status = conf.status;
    } else if (action === 'deployAppFlow') item.flows[conf.flow] = conf.flowObj;
    else if (action === 'deployAppFlows') item.flows = conf.flows;
    else if (action === 'deployApp') { item.flows = conf.flows; item.listeners = conf.listeners; }
    else throw new Error('Unknown deployment action');
  }
  validate(apps);
  const nextRouter = buildRouter(apps); // compile routes before affecting live state
  const affected = a => action === 'deployAll' || a.app === conf.app;
  const previous = registeredApps.filter(affected);
  const next = apps.filter(affected);
  await lifecycle(next, 'deploy.init');
  await lifecycle(previous, 'app.destroy');
  await dataStore.storeApps(apps);
  registeredApps = apps;
  runtimeRouter = nextRouter;
  cronManager.register(apps, (item, listener) => triggerFlow(item, listener.flow, 'cron').catch(err => console.error(err.message)));
  await lifecycle(next, 'app.init');
  await lifecycle(next, 'deploy.done');
}
module.exports = {
  deploy(req, res) {
    let conf;
    try {
      conf = typeof req.body.conf === 'string' ? JSON.parse(req.body.conf) : req.body.conf;
      if (!conf || typeof conf.action !== 'string') throw new Error('Missing deployment action');
    } catch (_) { return res.status(400).json({ status: 1, error: 'INVALID_CONFIGURATION' }); }
    if (conf.action === 'check' || conf.action === 'test') return dataStore.getApps().then(apps => res.json({status: 0, action: conf.action, apps}));
    if (conf.action === 'monitor') return res.json({ status: 0, data: { cpu: 0, mem: require('os').freemem(), disk: 0, server_time: new Date().toString(), requestCount: modServlet.analytic.requestCount, flowData: modServlet.analytic.flows } });
    // Serialize deployment requests so lifecycle ordering cannot race.
    const work = pending.then(() => deploy(conf));
    pending = work.catch(() => {});
    work.then(() => res.json({status: 0, action: conf.action}), err => res.status(400).json({status: 1, error: err.message}));
  },
  registerRouting(app) {
    registeredApps = [];
    runtimeRouter = express.Router();
    cronManager.clearJobs();
    app.use((req, res, next) => runtimeRouter(req, res, next));
  }
};
