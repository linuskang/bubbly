const winston = require('winston');
const { DateTime } = require('luxon');

const getFormattedTimestamp = () => {
    return DateTime.now().setZone('Australia/Brisbane').toFormat('dd/MM HH:mm');
};

const logger = () => {
    const logFormat = winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}]: ${message}`;
    });

    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp({ format: getFormattedTimestamp }),
            logFormat
        ),
        transports: [
            new winston.transports.Console({ 
                format: winston.format.combine(
                    winston.format.colorize(),
                    logFormat
                )
            }),
            new winston.transports.File({ filename: 'server.log' })
        ],
    });
    return logger;
};

module.exports = { logger };