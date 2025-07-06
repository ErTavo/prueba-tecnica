const log = require('loglevel');

const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug');
log.setLevel(logLevel);

const originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);
  
  return function (message, ...args) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${methodName.toUpperCase()}]`;
    
    if (typeof message === 'string') {
      rawMethod(`${prefix} ${message}`, ...args);
    } else {
      rawMethod(prefix, message, ...args);
    }
  };
};
log.setLevel(log.getLevel());

module.exports = log;
