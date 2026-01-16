import * as fs from 'node:fs';
import * as path from 'node:path';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayloadSystem {
  userId: string;
  userSystemId: string;
  nroDocumento: string;
  sid: string;
  role: string;
  systems: string[];
}

@Injectable()
export class KerberosJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: fs.readFileSync(path.join(process.cwd(), 'keys', 'public.pem'), 'utf8'),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayloadSystem) {
    return {
      idUsuario: payload.userId,
      idSistemaUsuario: payload.userSystemId,
      nroDocumento: payload.nroDocumento,
      sid: payload.sid,
      rol: payload.role,
      systems: payload.systems,
    };
  }
}
