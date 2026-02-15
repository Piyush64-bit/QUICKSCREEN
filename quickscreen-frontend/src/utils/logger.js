import winston from "winston";

// Browser-safe format
const browserFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

const logger = winston.createLogger({
  level: import.meta.env.VITE_LOG_LEVEL || "debug",
  format: winston.format.combine(
    winston.format.timestamp({ format: "HH:mm:ss" }),
    browserFormat
  ),
  transports: [
    new winston.transports.Console({
      consoleWarnLevels: ["warn"],
      consoleErrorLevels: ["error"],
    }),
  ],
});

// Create a wrapper to mimic the previous 'log' object but with Winston
export const log = {
  i: (msg, data) => logger.info(msg, data),
  s: (msg, data) => logger.info(`✅ ${msg}`, data), // Success (mapped to info)
  e: (msg, data) => logger.error(msg, data),
  w: (msg, data) => logger.warn(msg, data),
  d: (msg, data) => logger.debug(msg, data),
};

export default logger;
