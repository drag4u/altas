const winston = require('winston');
const { 
    NoRepeatFileTransport, 
    NoRepeatConsoleTransport 
} = require('./NoRepeatTransports');

class LoggerSetup {

    static GetConfig() {
        const commonFormat = winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message }) => {
                return `${timestamp} [${level}]: ${message}`;
            })
        );

        const transports = [
            new NoRepeatConsoleTransport({ handleExceptions: true }),
            new NoRepeatFileTransport({ filename: `./data/logs/${LoggerSetup.GetDate()}-Logs.log`, json: true })
        ];

        return {
            format: commonFormat,
            transports,
            exceptionHandlers: transports,
            rejectionHandlers: transports          
        };
    }

    static GetDate() {
		const date = new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}
}

module.exports = {
    LoggerSetup
};