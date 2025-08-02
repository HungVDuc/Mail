import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtRefreshService } from './jwt-refresh.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_REFRESH_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_REFRESH_EXPIRES_IN') || '7d',
        },
      }),
    }),
  ],
  providers: [JwtRefreshService],
  exports: [JwtRefreshService, JwtModule],
})
export class JwtRefreshModule {}
