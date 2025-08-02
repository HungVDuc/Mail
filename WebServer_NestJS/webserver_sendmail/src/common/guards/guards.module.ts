import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './jwt-auth.guard';
import { JwtAccessModule } from 'src/jwt/access/jwt-access.module';
import { JwtRefreshModule } from 'src/jwt/refresh/jwt-refresh.module';
import { RefreshTokenGuard } from './refresh-token.guard';
import { SessionModule } from 'src/session/session.module';


@Module({
  imports: [
    ConfigModule,
    JwtModule,
    JwtAccessModule,
    JwtRefreshModule,
    SessionModule
  ],
  providers: [AuthGuard, RefreshTokenGuard],
  exports: [AuthGuard, RefreshTokenGuard, JwtAccessModule, JwtRefreshModule, SessionModule],
})
export class GuardsModule {}
