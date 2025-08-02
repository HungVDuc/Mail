import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception.message || 'Lỗi hệ thống';

    const finalMessage =
      typeof message === 'string'
        ? message
        : (message as any).message || JSON.stringify(message);

    response.status(status).json({
      status: false,
      message: finalMessage,
      data: null,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
