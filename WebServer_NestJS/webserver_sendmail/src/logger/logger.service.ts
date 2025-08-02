import { LoggerService } from '@nestjs/common';
import { logger } from './winston-logger';

export class MyLogger implements LoggerService {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private formatMessage(message: string) {
    return this.context ? `[${this.context}] ${message}` : message;
  }

  log(message: string) {
    logger.info(this.formatMessage(message));
  }
  error(message: string, trace?: string) {
    logger.error(this.formatMessage(`${message} - ${trace}`));
  }
  warn(message: string) {
    logger.warn(this.formatMessage(message));
  }
  debug(message: string) {
    logger.debug(this.formatMessage(message));
  }
  verbose(message: string) {
    logger.verbose(this.formatMessage(message));
  }
}


