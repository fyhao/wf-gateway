'use strict';
const fs = require('fs');
const path = require('path');
class LogStore {
  constructor(options) {
    options = options || {};
    this.limit = options.limit || 1000;
    this.file = options.file;
    this.rows = [];
    if (this.file && fs.existsSync(this.file)) {
      // The file is rotated at a bounded size, not an unbounded startup read.
      const content = fs.readFileSync(this.file, 'utf8');
      content.split('\n').filter(Boolean).slice(-this.limit).forEach(line => {
        try { this.rows.push(JSON.parse(line)); } catch (_) { /* tolerate a torn last append */ }
      });
    }
  }
  append(item) {
    const row = { timestamp: new Date().toISOString(), app: String(item.app || ''), flow: String(item.flow || ''), message: String(item.message).slice(0, 8192) };
    this.rows.push(row);
    if (this.rows.length > this.limit) this.rows.splice(0, this.rows.length - this.limit);
    if (this.file) {
      fs.mkdirSync(path.dirname(this.file), { recursive: true, mode: 0o700 });
      if (fs.existsSync(this.file) && fs.statSync(this.file).size > 10 * 1024 * 1024) {
        fs.writeFileSync(this.file, this.rows.map(r => JSON.stringify(r)).join('\n') + '\n', { mode: 0o600 });
      } else fs.appendFileSync(this.file, JSON.stringify(row) + '\n', { mode: 0o600 });
    }
    return row;
  }
  tail(count, app) {
    const limit = Math.max(1, Math.min(this.limit, Math.floor(Number(count) || 100)));
    return this.rows.filter(row => !app || row.app === app).slice(-limit).map(row => Object.assign({}, row));
  }
}
module.exports = new LogStore({ file: process.env.WF_LOG_FILE });
module.exports.LogStore = LogStore;
