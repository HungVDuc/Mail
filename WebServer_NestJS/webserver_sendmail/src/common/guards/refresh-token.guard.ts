import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtRefreshService } from 'src/jwt/refresh/jwt-refresh.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtRefreshService: JwtRefreshService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies['refreshToken'];

    if (!refreshToken) throw new UnauthorizedException('No refresh token');
    try {
      const payload = await this.jwtRefreshService.verifyAsync(refreshToken);

      console.log('Payload cua Refresh Token:   ', payload);

      request['user'] = { ...payload, id: payload.userId }; // {userId, email, mailPassword} => authService => refresh token
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
