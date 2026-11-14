const crypto = require('crypto');
module.exports = function(app, options) {
  options = options || {};
  const secret = options.controlToken || process.env.WF_RUNTIME_TOKEN;
  app.use('/control', (req, res, next) => {
    if (!secret) return next(); // legacy local-development mode
    const supplied = Buffer.from((req.get('Authorization') || '').replace(/^Bearer /, ''));
    const expected = Buffer.from(secret);
    if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) return res.status(401).json({ error: 'RUNTIME_AUTHENTICATION_REQUIRED' });
    next();
  });
  const control = ProjRequire('lib/module/control');
  app.post('/control/deploy', control.deploy);
  app.get('/control/logs', (req, res) => res.json({ logs: require('./log-store').tail(req.query.limit, req.query.app) }));
  control.registerRouting(app);
};
