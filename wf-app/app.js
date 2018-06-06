const optionDefinitions = [
  { name: 'port', alias: 'p', type: Number }
]
const commandLineArgs = require('command-line-args')
const options = commandLineArgs(optionDefinitions)
var server = require('./server.js')({port:options.port});