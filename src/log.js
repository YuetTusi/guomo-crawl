const path = require('path');
const { createLogger, transports, format } = require('winston');

const { combine, timestamp, printf } = format;

let loggerPath = path.resolve(process.cwd(), 'log.txt');

const formatLog = printf(({ level, message, timestamp }) => {
	return `[${timestamp}] [${level}]: ${message}`;
});

const logger = createLogger({
	format: combine(timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }), formatLog),
	transports: [
		new transports.File({
			filename: loggerPath,
			maxsize: 524288
		})
	]
});

module.exports = logger;
