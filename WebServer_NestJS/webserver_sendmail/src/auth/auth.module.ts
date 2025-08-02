import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';
import { HttpModule } from '@nestjs/axios';
import { GuardsModule } from 'src/common/guards/guards.module';
import { SessionModule } from 'src/session/session.module';
import { DomainModule } from 'src/domain/domain.module';

@Module({
  imports: [
    HttpModule,
    UserModule,
    MailModule,
    GuardsModule,
    SessionModule,
    DomainModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
