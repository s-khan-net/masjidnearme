const winston = require('winston');
require('dotenv').config();

const transports = [];
if (process.env.NODE_ENV == 'development') {
    transports.push(
        new winston.transports.Console()
    )
} else {
    transports.push(
        new winston.transports.Console()
    )
    transports.push(
        new winston.transports.File({
            filename: 'mnm-logs/combined.log',
        }),
    )
}

const LoggerInstance = winston.createLogger({
    level: process.env.LOG_LEVEL,
    levels: winston.config.npm.levels,
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'DD-MM-YYYY HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports
});

module.exports = LoggerInstance