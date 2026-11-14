'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
module.exports = {
  process(ctx, step, next) {
    const options = ctx.req && ctx.req.uploadOptions;
    if (!options || !options.directory || !Buffer.isBuffer(ctx.req.body)) {
      ctx.res.status(415).json({ error: 'UPLOAD_REQUIRES_OCTET_STREAM' });
      ctx.enable_FLOW_ENGINE_CANCELLED();
      return;
    }
    const bytes = ctx.req.body;
    if (bytes.length > options.maxBytes) {
      ctx.res.status(413).json({ error: 'UPLOAD_TOO_LARGE' });
      ctx.enable_FLOW_ENGINE_CANCELLED();
      return;
    }
    const id = crypto.randomBytes(24).toString('hex');
    fs.mkdir(options.directory, { recursive: true, mode: 0o700 }, err => {
      if (err) return fail();
      fs.writeFile(path.join(options.directory, id), bytes, { flag: 'wx', mode: 0o600 }, err => {
        if (err) return fail();
        ctx.vars[step.var || 'upload'] = { id, size: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
        next();
      });
    });
    function fail() {
      ctx.res.status(500).json({ error: 'UPLOAD_STORAGE_FAILED' });
      ctx.enable_FLOW_ENGINE_CANCELLED();
    }
  }
};
