import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { connect, ImapSimple, Message } from 'imap-simple';
import { UserService } from 'src/user/user.service';
import { simpleParser } from 'mailparser';
import { MailFilterDto } from './dto/MailFilterDto';
import { SendMailDto } from './dto/SendMailDto';
import { ConfigService } from '@nestjs/config';
import { SessionService } from 'src/session/session.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(
    private userService: UserService,
    private config: ConfigService,
    private sessionService: SessionService,
  ) {}

  private createTransporter(user: string, pass: string) {
    return nodemailer.createTransport({
      host: this.config.get('MAILSERVER_SMTP_HOST') || 'localhost',
      port: Number(this.config.get('MAILSERVER_SMTP_PORT')) || 587,
      secure: this.config.get('MAILSERVER_SMTP_SECURE') === 'true',
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  }

  async sendMail(
    sendMailDto: SendMailDto,
    user: any,
    files: Express.Multer.File[],
  ) {
    const attachments = files?.length
      ? files.map((file) => ({
          filename: file.filename,
          path: file.path,
          size: file.size,
        }))
      : undefined;

    this.logger.log(
      `Sending mail from ${user.email} to ${sendMailDto.to} | Subject: "${sendMailDto.subject}" | Attachments: ${attachments?.length || 0}`,
    );

    const info = await this.createTransporter(
      user.email,
      user.mailPassword,
    ).sendMail({
      from: user.email,
      to: sendMailDto.to,
      subject: sendMailDto.subject,
      text: sendMailDto.text,
      ...(attachments && { attachments }),
    });

    this.logger.log(`Mail sent successfully | messageId: ${info.messageId}`);

    return info.messageId;
  }

  async getImapConnection(
    username: string,
    mailbox: string = 'INBOX',
  ): Promise<ImapSimple> {
    const password =
      this.sessionService.getPassword(username) ??
      this.sessionService.getAccessToken(username);
    if (!password) {
      this.logger.warn(`Không tìm thấy mật khẩu trong session cho ${username}`);
      throw new Error('Không tìm thấy mật khẩu trong session');
    }

    this.logger.log(`Đang kết nối IMAP cho: ${username}`);

    const config = {
      imap: {
        user: username,
        password: password,
        host: this.config.get('MAILSERVER_IMAP_HOST') || 'localhost',
        port: Number(this.config.get('MAILSERVER_IMAP_PORT')) || 143,
        tls: this.config.get('MAILSERVER_IMAP_TLS') === 'true',
        authTimeout: 10000,
      },
    };

    const connection = await connect(config);
    await connection.openBox(mailbox);

    this.logger.log(`Đã kết nối và mở hộp thư INBOX cho: ${username}`);

    // 3. Cache lại connection
    this.sessionService.setSessionImap(username, connection);

    return connection;
  }

  async fetchAndParseMails(
    user: any,
    filter?: MailFilterDto,
    mailbox = 'INBOX',
  ) {
    const infoUser = await this.userService.findById(user.userId);
    if (!infoUser) {
      this.logger.warn(`User không tồn tại: ${user.userId}`);
      throw new NotFoundException('User not found');
    }

    this.logger.log(`Đang lấy email cho: ${infoUser.email}`);

    const connection: ImapSimple = await this.getImapConnection(
      infoUser.email,
      mailbox,
    );

    // --- Build search criteria ---

    const searchCriteria: any[] = ['ALL'];

    if (filter?.fromDate) {
      searchCriteria.push(['SINCE', new Date(filter.fromDate)]);
    }
    if (filter?.toDate) {
      searchCriteria.push(['BEFORE', new Date(filter.toDate)]);
    }
    if (filter?.from) {
      searchCriteria.push(['FROM', filter.from]);
    }
    if (filter?.subject) {
      searchCriteria.push(['SUBJECT', filter.subject]);
    }

    if (filter?.hasAttachment) {
      searchCriteria.push(['HEADER', 'Content-Type', 'multipart/mixed']);
    }

    const fetchOptions = {
      bodies: [''],
      markSeen: false,
    };

    const messages: Message[] = await connection.search(
      searchCriteria,
      fetchOptions,
    );

    this.logger.log(`Tìm thấy ${messages.length} email`);

    const mails = await Promise.all(
      messages.map(async (item) => {
        const all = item.parts.find((p) => p.which === '')?.body;

        const parsed = await simpleParser(all);
        return {
          from: parsed.from?.text,
          subject: parsed.subject,
          date: parsed.date,
          body: parsed.text || parsed.html || '',
          attachments: parsed.attachments.map((att) => ({
            filename: att.filename,
            contentType: att.contentType,
            size: att.size,
          })),
        };
      }),
    );

    connection.end();
    const sortedEmails = mails.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    this.logger.log(`Hoàn tất xử lý ${sortedEmails.length} email`);
    return sortedEmails;
  }

  async getInbox(user: any) {
    this.logger.log(`Gọi API getInbox cho userId: ${user.userId}`);
    return await this.fetchAndParseMails(user);
  }

  async getSent(user: any) {
    this.logger.log(`Gọi API getSent cho userId: ${user.userId}`);
    return await this.fetchAndParseMails(user, undefined, 'Sent'); 
  }

  async advancedSearch(
    user: any,
    filter: MailFilterDto & { keyword?: string },
  ) {
    const box = filter.box || 'INBOX';
    const mails = await this.fetchAndParseMails(user, filter, box);

    if (filter.keyword && filter.keyword.trim() !== '') {
      const keyword = filter.keyword.toLowerCase();

      return mails.filter(
        (m) =>
          m.subject?.toLowerCase().includes(keyword) ||
          m.body?.toLowerCase().includes(keyword),
      );
    }

    return mails;
  }
}
