'use strict';
const crypto = require('crypto');
const fs = require('fs');
const scryptOptions = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return 'scrypt$' + salt + '$' + crypto.scryptSync(password, salt, 64, scryptOptions).toString('hex');
}
function verifyPassword(password, encoded) {
  if (typeof password !== 'string' || password.length > 1024 || typeof encoded !== 'string') return false;
  const parts = encoded.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt' || !/^[a-f0-9]{32}$/.test(parts[1]) || !/^[a-f0-9]{128}$/.test(parts[2])) return false;
  return crypto.timingSafeEqual(crypto.scryptSync(password, parts[1], 64, scryptOptions), Buffer.from(parts[2], 'hex'));
}
function fromEnvironment() {
  if (!process.env.WF_AUTH_FILE) return { enabled: false };
  return Object.assign({}, JSON.parse(fs.readFileSync(process.env.WF_AUTH_FILE, 'utf8')), { enabled: true });
}
function permissionFor(req) {
  const first = req.path.split('/')[1];
  const modules = { app: 'app', instance: 'instance', backup: 'backup', monitor: 'monitor', datasource: 'datasource' };
  return (modules[first] || first) + ':' + (/^(GET|HEAD)$/.test(req.method) ? 'read' : 'edit');
}
function install(app, options) {
  const cfg = options || fromEnvironment();
  const sessions = new Map();
  const attempts = new Map();
  const users = cfg.users || [];
  const ttl = cfg.sessionTTL || 3600000;
  const dummyHash = hashPassword(crypto.randomBytes(32).toString('hex'));
  function sweep() {
    const now = Date.now();
    for (const [key, value] of sessions) if (value.expires <= now) sessions.delete(key);
    for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
  }
  function token(req) { return (req.get('Authorization') || '').replace(/^Bearer /, ''); }
  app.get('/auth/status', (req, res) => res.json({ enabled: !!cfg.enabled }));
  app.post('/auth/login', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    if (!cfg.enabled) return res.status(409).json({ error: 'AUTH_DISABLED' });
    sweep();
    const key = req.ip;
    const recent = attempts.get(key);
    if ((recent && recent.count >= 10) || (!recent && attempts.size >= 10000)) return res.status(429).json({ error: 'LOGIN_RATE_LIMIT' });
    attempts.set(key, { count: (recent ? recent.count : 0) + 1, until: recent ? recent.until : Date.now() + 60000 });
    const user = users.find(u => u.username === req.body.username);
    const valid = verifyPassword(req.body.password, user ? user.passwordHash : dummyHash);
    if (!user || !valid || user.disabled) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    // MFA is an explicit hook: configured users fail closed if no verifier is installed.
    if (user.mfaRequired) {
      try {
        if (!cfg.verifySecondFactor || !(await cfg.verifySecondFactor(user, req.body.secondFactor))) return res.status(401).json({ error: 'SECOND_FACTOR_REQUIRED' });
      } catch (_) { return res.status(401).json({ error: 'SECOND_FACTOR_REQUIRED' }); }
    }
    if (sessions.size >= 10000) return res.status(503).json({ error: 'SESSION_CAPACITY' });
    attempts.delete(key);
    const accessToken = crypto.randomBytes(32).toString('hex');
    sessions.set(accessToken, { user: user, expires: Date.now() + ttl });
    res.json({ accessToken: accessToken, expiresIn: ttl / 1000 });
  });
  app.post('/auth/logout', (req, res) => { sessions.delete(token(req)); res.json({ status: 0 }); });
  app.use((req, res, next) => {
    if (!cfg.enabled || req.method === 'OPTIONS' || req.path === '/') return next();
    sweep();
    const session = sessions.get(token(req));
    if (!session || session.user.disabled) return res.status(401).json({ error: 'AUTHENTICATION_REQUIRED' });
    const user = session.user;
    const roleNames = new Set(user.roles || []);
    (user.groups || []).forEach(group => ((cfg.groups || {})[group] || []).forEach(role => roleNames.add(role)));
    const permissions = new Set();
    roleNames.forEach(role => ((cfg.roles || {})[role] || []).forEach(p => permissions.add(p)));
    // Recovery uses a separately configured, normally authenticated superadmin; never a bypass URL.
    if (user.superadmin || permissions.has('*') || permissions.has(permissionFor(req))) { req.user = user.username; return next(); }
    res.status(403).json({ error: 'PERMISSION_DENIED', permission: permissionFor(req) });
  });
}
module.exports = { install, hashPassword, verifyPassword, permissionFor };
