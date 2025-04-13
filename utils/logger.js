const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: 'logs/license-%DATE%.log', // Log file name with date placeholder
      datePattern: 'YYYY-MM-DD', // Format for the date in the filename
      zippedArchive: true, // Compress old log files
      maxSize: '20m', // Maximum size of a log file before rotation
      maxFiles: '14d', // Keep logs for the last 14 days
    }),
  ],
});

module.exports = logger;