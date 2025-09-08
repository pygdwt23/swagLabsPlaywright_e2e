import pino from 'pino';
import path from 'path';

const logger = pino({
  transport: {
    target: require.resolve('pino-pretty'),
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
  hooks: {
    logMethod(args, method) {
      const stack = new Error().stack?.split('\n')[3].trim();
      const match = stack?.match(/\((.*):(\d+):(\d+)\)$/);

      if (match) {
        const [, filePath, line, col] = match;
        const fileName = path.relative(process.cwd(), filePath);
        args[0] = `[${fileName}:${line}:${col}] ${args[0]}`;
      }

      return method.apply(this, args);
    },
  },
});

export default logger;
