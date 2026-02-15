const logLevel = import.meta.env.VITE_LOG_LEVEL || "debug";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const shouldLog = (level) => {
  return levels[level] <= levels[logLevel];
};

const formatMessage = (level, message, data) => {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}] ${level.toUpperCase()}:`;
  
  if (data && Object.keys(data).length > 0) {
    return [prefix, message, data];
  }
  return [prefix, message];
};

const logger = {
  info: (msg, data) => {
    if (shouldLog("info")) {
      console.log(...formatMessage("info", msg, data));
    }
  },
  warn: (msg, data) => {
    if (shouldLog("warn")) {
      console.warn(...formatMessage("warn", msg, data));
    }
  },
  error: (msg, data) => {
    if (shouldLog("error")) {
      console.error(...formatMessage("error", msg, data));
    }
  },
  debug: (msg, data) => {
    if (shouldLog("debug")) {
      console.debug(...formatMessage("debug", msg, data));
    }
  },
};

// Create a wrapper to mimic the previous 'log' object
export const log = {
  i: (msg, data) => logger.info(msg, data),
  s: (msg, data) => logger.info(`✅ ${msg}`, data), // Success (mapped to info)
  e: (msg, data) => logger.error(msg, data),
  w: (msg, data) => logger.warn(msg, data),
  d: (msg, data) => logger.debug(msg, data),
};

export default logger;
