import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ImapClientService } from 'src/mail/imap-client.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { JwtAccessService } from 'src/jwt/access/jwt-access.service';
import { JwtRefreshService } from 'src/jwt/refresh/jwt-refresh.service';
import { RegisterDto } from './dto/RegisterDto';
import { LoginDto } from './dto/LoginDto';
import { DomainService } from 'src/domain/domain.service';
import * as crypto from 'crypto';
// import sha512crypt from 'sha512crypt-node';
const sha512crypt = require('sha512crypt-node');
import { SessionService } from 'src/session/session.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UserService,
    private imapClientService: ImapClientService,
    private http: HttpService,
    private config: ConfigService,
    private jwtAccessService: JwtAccessService,
    private jwtRefreshService: JwtRefreshService,
    private domainService: DomainService,
    private sessionService: SessionService,
  ) {}

  async generateTokens(user: any) {
    const payload = {
      userId: user.id,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtAccessService.signAsync(payload),
      this.jwtRefreshService.signAsync(payload),
    ]);

    return { accessToken, refreshToken };
  }

  async createUserIfNotExists(
    email: string,
    password?: string,
    otherInfo: any = {},
    isThirdParty = false,
  ) {
    this.logger.log(`Checking if user exists: ${email}`);
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) return { user: existingUser, isNew: false };

    const [username, domainName] = email.split('@');

    this.logger.log(`Checking domain: ${domainName}`);
    const domains = await this.domainService.findAll();

    const allowedDomains = domains.map((domain) => domain.name);
    if (!allowedDomains.includes(domainName)) {
      const allowed = allowedDomains.join(', ');
      this.logger.warn(`Invalid domain: ${domainName}. Allowed: ${allowed}}`);
      throw new BadRequestException(`Phải tạo tài khoản có đuôi: ${allowed}`);
    }

    let storedPassword: string | null = null;

    if (!isThirdParty) {
      if (!password) throw new BadRequestException('Mật khẩu không tồn tại');
      this.logger.log(`Hashing password for: ${email}`);
      const rawSalt = crypto.randomBytes(8).toString('hex');
      const salt = `$6$${rawSalt}`;
      const hashed = sha512crypt.sha512crypt(password, salt);
      storedPassword = `{SHA512-CRYPT}${hashed}`;
    }

    const maildirPath = `/var/mail/vhosts/${domainName}/${username}`;
    this.logger.log(`Creating user with maildir: ${maildirPath}`);

    const newUser = await this.usersService.create({
      email,
      password: storedPassword,
      homeDir: maildirPath,
      ...otherInfo,
    });

    this.logger.log(`Created new user: ${email}`);
    return { user: newUser, isNew: true };
  }

  async register(registerDto: RegisterDto) {
    this.logger.log(`Processing register for: ${registerDto.email}`);
    const { user, isNew } = await this.createUserIfNotExists(
      registerDto.email,
      registerDto.password,
      { name: registerDto.name },
    );

    this.logger.log(`${isNew ? 'Created' : 'Found'} user: ${user.email}`);

    const { accessToken, refreshToken } = await this.generateTokens(user);
    this.logger.log(`Generated tokens for: ${user.email}`);
    return { accessToken, refreshToken };
  }

  async verifyImapLogin(email: string, password: string): Promise<void> {
    try {
      const connected = await this.imapClientService.connect(email, password);
      if (!connected) {
        this.logger.warn(`IMAP connect trả về false cho ${email}`);
        throw new UnauthorizedException('Kết nối IMAP thất bại');
      }
    } catch (error) {
      this.logger.error(`Lỗi kết nối IMAP cho ${email}`, error.stack);
      throw new UnauthorizedException(
        'Không thể đăng nhập IMAP với thông tin đã cung cấp',
      );
    }
  }

  async login(loginDto: LoginDto) {
    const email = loginDto.email;
    this.logger.log(`Bắt đầu xử lý login cho ${email}`);

    const [username, domainName] = email.split('@');

    const domains = await this.domainService.findAll();

    const allowedDomains = domains.map((domain) => domain.name);
    if (!allowedDomains.includes(domainName)) {
      const allowed = allowedDomains.join(', ');
      this.logger.warn(`Email không thuộc domain hợp lệ: ${email}`);
      throw new BadRequestException(`Tài khoản có đuôi: ${allowed}`);
    }

    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      this.logger.warn(`Không tìm thấy user với email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    try {
      await this.verifyImapLogin(email, loginDto.password);
    } catch (err) {
      this.logger.warn(`Đăng nhập IMAP thất bại: ${email}`);
      throw err;
    }

    this.sessionService.setPassword(email, loginDto.password);
    this.logger.log(`Lưu session tạm thời cho ${email}`);

    const { accessToken, refreshToken } = await this.generateTokens(user);

    this.logger.log(`Đăng nhập hoàn tất cho ${email}`);
    return { accessToken, refreshToken };
  }

  async verifyAccessToken(username: string, language: string = 'en') {
    if (!username) {
      this.logger.warn('verifyAccessToken: Thiếu username');
      throw new UnauthorizedException('Thiếu username');
    }

    const tokenUrl = this.config.get('LAOID_TOKEN_VERIFY_URL');
    const accessToken = this.sessionService.getAccessToken(username);

    if (!accessToken) {
      this.logger.log(`User ${username} sử dụng hình thức đăng nhập khác`);
      return false;
    }

    this.logger.log(
      `verifyAccessToken: Đang xác thực accessToken cho ${username} - ${accessToken?.slice(0, 10)}...`,
    );

    try {
      const response = await firstValueFrom(
        this.http.post(
          tokenUrl,
          {
            clientId: this.config.get('LAOID_CLIENT_ID'),
            clientSecret: this.config.get('LAOID_CLIENT_SECRET'),
            accessToken,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Accept-Language': language,
            },
          },
        ),
      );

      const { data } = response;

      switch (data.statusCode) {
        case 'THIRDPARTY1208':
          this.logger.log(`Access token hợp lệ cho ${username}`);
          return data?.data?.verified === true;

        case 'THIRDPARTY1209':
          this.logger.warn(`Access token không hợp lệ cho ${username}`);
          throw new UnauthorizedException('Access token không hợp lệ');

        case 'THIRDPARTY0222':
          this.logger.error(`Client ID hoặc Secret không hợp lệ`);
          throw new UnauthorizedException('Client ID hoặc Secret không hợp lệ');

        case 'THIRDPARTY0223':
          this.logger.error(`Xác thực token thất bại`);
          throw new UnauthorizedException('Xác thực token thất bại');

        default:
          this.logger.error(`Lỗi xác thực không xác định: ${data.statusCode}`);
          throw new InternalServerErrorException('Lỗi xác thực không xác định');
      }
    } catch (error) {
      this.logger.error(`Lỗi khi gửi yêu cầu xác thực token: ${error.message}`);
      throw new InternalServerErrorException(
        'Lỗi khi gửi yêu cầu xác thực token',
      );
    }
  }

  async loginWithLaoID(code: string) {
    if (!code) {
      this.logger.warn('Thiếu mã code trong yêu cầu LaoID');
      throw new UnauthorizedException('Thiếu mã code');
    }

    const tokenUrl = this.config.get('LAOID_TOKEN_URL');
    const userInfoUrl = this.config.get('LAOID_TOKEN_USERINFO_URL');

    try {
      // Gửi code kèm clientSecret
      this.logger.log(`Bắt đầu xử lý OAuth2 LaoID với code: ${code}`);
      const tokenRes = await firstValueFrom(
        this.http.post(
          tokenUrl,
          {
            clientId: this.config.get('LAOID_CLIENT_ID'),
            clientSecret: this.config.get('LAOID_CLIENT_SECRET'),
            code,
            grant_type: 'authorization_code',
            redirect_uri: this.config.get('LAOID_REDIRECT_URL'),
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Accept-Language': 'en', // vi
            },
          },
        ),
      );

      const { accessToken } = tokenRes.data.data;

      // Lấy thông tin người dùng
      const userRes = await firstValueFrom(
        this.http.get(userInfoUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Accept-Language': 'en', // vi
            'x-api-key': this.config.get('LAOID_CLIENT_ID'),
          },
        }),
      );

      const laoUser = userRes.data.data;
      this.logger.log(
        `Thông tin người dùng từ LaoID: email=${laoUser.email[0]?.email}, tên=${laoUser.firstName}`,
      );

      const { user, isNew } = await this.createUserIfNotExists(
        laoUser.email[0]?.email,
        undefined,
        { name: laoUser.firstName },
        true,
      );

      this.logger.log(`${isNew ? 'Created' : 'Found'} user: ${user.email}`);

      this.sessionService.setAccessToken(user.email, accessToken);

      await this.verifyImapLogin(user.email, ' '); // Phải tồn tại password
      this.logger.log(`Đã xác thực IMAP cho user: ${user.email}`);

      return this.generateTokens(user);
    } catch (error) {
      this.logger.error(
        'Lỗi khi login với LaoID',
        error.stack || error.message,
      );
      throw new Error('LaoID login failed');
    }
  }
}
