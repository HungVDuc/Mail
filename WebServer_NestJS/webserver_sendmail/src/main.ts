import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/interceptors/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { MyLogger } from './logger/logger.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new MyLogger(), 
  });

  const configService = app.get(ConfigService);

  const allowedOrigins = (configService.get('CORS_ORIGINS') || '')
    .split(',')
    .map((origin) => origin.trim());

  app.use(cookieParser());
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: 'Content-Type,Accept,Authorization',
  });

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động loại bỏ field không có trong DTO
      forbidNonWhitelisted: true, // Nếu có field không có trong DTO -> ném lỗi
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
