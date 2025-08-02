import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Logger } from '@nestjs/common';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('LoggingInterceptor');
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;

    this.logger.log(`[${method}] ${url} - Bắt đầu xử lý`);
    // this.logger.log('Request body:', body);

    const now = Date.now();

    return next.handle().pipe(
      tap((responseData) => {
        const duration = Date.now() - now;
        this.logger.log(`[${method}] ${url} - Hoàn tất xử lý sau ${duration}ms`);
        // this.logger.log('Response:', responseData);
      }),
    );
  }
}
