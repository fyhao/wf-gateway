const logs = require('../../../log-store');
module.exports = {
  process: function(ctx, step, next) {
    if (typeof step.log !== 'undefined') {
      const row = logs.append({ app: ctx.app, flow: ctx.flow, message: step.log });
      if (ctx._logs) ctx._logs.push(row.message);
    } else if (step.dumpSystemLog) {
      ctx.vars[step.var || 'systemLog'] = (ctx._logs || []).join('\n');
      ctx._logs = [];
    }
    process.nextTick(next);
  }
};
