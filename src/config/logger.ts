import pino from 'pino';
import { env } from '.';

export default pino({
  transport: {
    target: 'pino-pretty',
  },
  messageKey: 'message',
  level: env.getOptional('LOG_LEVEL', 'debug'),
});
