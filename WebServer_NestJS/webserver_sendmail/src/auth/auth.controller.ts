import {
  UseGuards,
  Body,
  Controller,
  Post,
  Res,
  Req,
  Logger,
} from '@nestjs/common';
import { RefreshTokenGuard } from '../common/guards/refresh-token.guard';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/RegisterDto';
import { LoginDto } from './dto/LoginDto';

@Controller('api/v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { password, ...safeDto } = registerDto;
    this.logger.log(`Register request: ${JSON.stringify(safeDto)}`);
    const { accessToken, refreshToken } =
      await this.authService.register(registerDto);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    this.logger.log(`Register successful for: ${registerDto.email}`);
    return { accessToken };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log(`Bắt đầu đăng nhập: ${loginDto.email}`);

    try {
      const { accessToken, refreshToken } =
        await this.authService.login(loginDto);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      this.logger.log(`Đăng nhập thành công: ${loginDto.email}`);
      return { accessToken };
    } catch (error) {
      this.logger.warn(
        `Đăng nhập thất bại cho ${loginDto.email}: ${error.message}`,
      );
      throw error;
    }
  }

  @Post('laoid/callback')
  async handleLaoIDCallback(
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log(`Received LaoID callback with code: ${code}`);
    const { accessToken, refreshToken } =
      await this.authService.loginWithLaoID(code);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax', // strict
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  @Post('dovecot/verify')
  async dovecotVerify(@Body() body, @Res() res: Response) {
    const username = body.username;

    const result = await this.authService.verifyAccessToken(username);

    if (result) {
      return res.status(200).send('OK');
    } else {
      return res.status(401).send('FAIL');
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req['user'];
    const { accessToken, refreshToken } =
      await this.authService.generateTokens(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax', // strict
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken');
    return { message: 'Logged out' };
  }
}
