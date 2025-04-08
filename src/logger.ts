const logger = {
  error: (message: unknown) => console.error(`ERROR: ${message}`),
  warn: (message: unknown) => console.warn(`WARN: ${message}`),
  info: (message: unknown) => console.info(`INFO: ${message}`),
};

export default logger;
