import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtRefreshService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: any): string {
    return this.jwtService.sign(payload);
  }

  async signAsync(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  verify(token: string): any {
    return this.jwtService.verify(token);
  }

  async verifyAsync(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token);
  }
}