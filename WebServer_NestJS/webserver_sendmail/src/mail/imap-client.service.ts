import { Injectable } from '@nestjs/common';
import { MailGateway } from './mail.gateway';
import { connect, ImapSimple, ImapSimpleOptions } from 'imap-simple';

import { simpleParser } from 'mailparser';
import { ConfigService } from '@nestjs/config';
import { SessionService } from 'src/session/session.service';

@Injectable()
export class ImapClientService {
  private clients = new Map<string, ImapSimple>();

  constructor(
    private readonly gateway: MailGateway,
    private readonly config: ConfigService,
    private readonly sessionService: SessionService,
  ) {}

  async connect(userEmail: string, password: string): Promise<boolean> {
    const cached = this.sessionService.getSessionImap(userEmail);
    if (cached) {
      console.log(`IMAP đã được kết nối cho ${userEmail}`);
      const imap = this.sessionService.getSessionImap(userEmail);
      return true;
    }

    const config: ImapSimpleOptions = {
      imap: {
        user: userEmail,
        password,
        host: this.config.get('MAILSERVER_IMAP_HOST') || 'localhost',
        port: Number(this.config.get('MAILSERVER_IMAP_PORT')) || 143,
        tls: this.config.get('MAILSERVER_IMAP_TLS') === 'true',
        authTimeout: 10000,
        tlsOptions: { rejectUnauthorized: false },
        keepalive: {
          interval: 10000,
          idleInterval: 300000,
          forceNoop: true,
        },
      },
    };

    try {
      const connection = await connect(config);
      await connection.openBox('INBOX');

      // Lắng nghe mail mới

      connection.imap.on('mail', () => {
        const imap = connection.imap;

        imap.openBox('INBOX', false, (err, box) => {
          if (err) {
            console.error('Lỗi khi mở INBOX:', err);
            return;
          }

          const fetch = imap.seq.fetch(`${box.messages.total}:*`, {
            bodies: '',
            markSeen: false,
          });

          fetch.on('message', (msg) => {
            let buffer = '';

            msg.on('body', (stream) => {
              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
              });

              stream.on('end', async () => {
                const parsed = await simpleParser(buffer);

                const mailData = {
                  subject: parsed.subject,
                  from: parsed.from?.text || '',
                  body: parsed.text,
                  date: parsed.date,
                  attachments: parsed.attachments.map((att) => ({
                    filename: att.filename,
                    contentType: att.contentType,
                    size: att.size,
                  })),
                };

                this.gateway.notifyNewMail(mailData);
                console.log(`Mail mới gửi qua gateway cho ${userEmail}`);
              });
            });
          });

          fetch.on('error', (fetchErr) => {
            console.error('Lỗi khi fetch mail:', fetchErr);
          });

          fetch.on('end', () => {
            console.log('Fetch mail xong');
          });
        });
      });

      // Bắt lỗi kết nối
      connection.imap.on('error', (err) => {
        console.error(`IMAP error (${userEmail}):`, err.message);
        this.sessionService.clearSessionImap(userEmail);
        this.clients.delete(userEmail);
      });

      // Kết nối bị đóng
      connection.imap.on('close', (hadError) => {
        console.warn(
          `IMAP connection closed for ${userEmail}. Error: ${hadError}`,
        );
        // this.sessionService.clearSessionImap(userEmail);
        this.clients.delete(userEmail);
      });

      connection.imap.on('end', () => {
        console.warn(`IMAP connection ended for ${userEmail}`);
      });

      // Cache lại
      this.sessionService.setSessionImap(userEmail, connection);
      this.clients.set(userEmail, connection);

      return true;
    } catch (err) {
      console.error(`Lỗi kết nối IMAP (${userEmail}):`, err.message);
      this.clients.delete(userEmail);
      return false;
    }
  }

  // Tuỳ chọn: ngắt kết nối
  disconnect(userEmail: string) {
    const imap = this.clients.get(userEmail);
    if (imap) {
      imap.end();
      this.clients.delete(userEmail);
      this.sessionService.clearSessionImap(userEmail);
    }
  }
}
