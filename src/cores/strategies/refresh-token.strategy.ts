import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('REFRESH_TOKEN_SECRET_KEY'),
      passReqToCallback: true,
    });
  }

  validate(request: Request, payload: any) {
    const refreshToken = request
      .get('Authorization')
      ?.replace('Bearer', '')
      .trim();
    return { ...payload, refreshToken };
  }
}
