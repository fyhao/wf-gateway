'use strict';
const counters = new Map();
module.exports = {
  process(ctx, step, next) {
    if (!Array.isArray(step.backends) || !step.backends.length || step.backends.some(url => typeof url !== 'string' || !/^https?:\/\//.test(url))) throw new Error('loadBalance requires HTTP(S) backends');
    const key = JSON.stringify([ctx.app, step.pool || 'default', step.backends]);
    const cursor = counters.get(key) || 0;
    if (counters.size >= 1000 && !counters.has(key)) counters.delete(counters.keys().next().value);
    ctx.vars[step.var || 'backend'] = step.backends[cursor % step.backends.length];
    counters.set(key, (cursor + 1) % step.backends.length);
    process.nextTick(next);
  }
};
