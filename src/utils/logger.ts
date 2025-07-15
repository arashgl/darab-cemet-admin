/* eslint-disable no-console */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface Logger {
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
  debug: (message: string, ...args: unknown[]) => void;
}

const isDevelopment = import.meta.env.DEV;

const createLogger = (): Logger => {
  const log = (level: LogLevel, message: string, ...args: unknown[]) => {
    if (!isDevelopment) return; // Don't log in production

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'info':
        console.info(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        break;
      case 'debug':
        console.debug(prefix, message, ...args);
        break;
      default:
        console.log(prefix, message, ...args);
    }
  };

  return {
    info: (message: string, ...args: unknown[]) =>
      log('info', message, ...args),
    warn: (message: string, ...args: unknown[]) =>
      log('warn', message, ...args),
    error: (message: string, ...args: unknown[]) =>
      log('error', message, ...args),
    debug: (message: string, ...args: unknown[]) =>
      log('debug', message, ...args),
  };
};

export const logger = createLogger();
