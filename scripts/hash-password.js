'use strict';
// Supply the password on stdin, never in the command line or a committed config.
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  const password = input.replace(/\r?\n$/, '');
  if (password.length < 12 || password.length > 1024) throw new Error('Use a password of 12–1024 characters');
  console.log(require('../wf-control/lib/auth').hashPassword(password));
});
