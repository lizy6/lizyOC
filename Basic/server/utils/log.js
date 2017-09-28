
let config = require('../config')
let env = config.env

let logTo = ''
let logLevel = ''
if(config[env].logTo == null || !['stdout','file'].includes(config[env].logTo.toLowerCase())) {
	logTo = 'stdout';
} else {
	logTo = config[env].logTo.toLowerCase()
}
if(config[env].logLevel == null || !['trace','debug','info'].includes(config[env].logLevel.toLowerCase())) {
	logLevel = 'debug';
} else {
	logLevel = config[env].logLevel.toLowerCase()
}
if(env != 'dev') {
	logLevel = 'info'
}

module.exports = function (category) {
	var log4js = require('log4js')
	log4js.configure({
		appenders: {
			STDOUT: {
				type: 'console'
			},
			FILE: {
				type: 'dateFile',
				pattern: '-yyyy-MM-dd',
				filename: 'log/server.log',
				//maxLogSize: 1048576,
				backups: 7
			}
		},
		categories: {
			default: {appenders: [logTo.toUpperCase()], level: logLevel}
		}
	})
	return log4js.getLogger(category)
}
