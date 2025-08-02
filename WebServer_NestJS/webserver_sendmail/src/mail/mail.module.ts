import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { MailGateway } from './mail.gateway';
import { ImapClientService } from './imap-client.service';
import { GuardsModule } from 'src/common/guards/guards.module';
import { JwtAccessModule } from 'src/jwt/access/jwt-access.module';
import { JwtRefreshModule } from 'src/jwt/refresh/jwt-refresh.module';
import { ConfigModule } from '@nestjs/config';
import { SessionModule } from 'src/session/session.module';

@Module({
  imports: [JwtModule, UserModule, GuardsModule, JwtAccessModule, JwtRefreshModule, ConfigModule, SessionModule],
  providers: [MailService, MailGateway, ImapClientService],
  controllers: [MailController],
  exports: [ImapClientService],
})
export class MailModule {}
