const winston = require('winston');
const { LoggerSetup } = require('./core/LoggerSetup');
const logger = winston.createLogger(LoggerSetup.GetConfig());
const { DatabaseInitializer } = require('./core/DatabaseInitializer');
const { API } = require('./core/api/api');

const databaseInitializer = new DatabaseInitializer(logger, () => {
	const api = new API(3000, logger, databaseInitializer.database);
});