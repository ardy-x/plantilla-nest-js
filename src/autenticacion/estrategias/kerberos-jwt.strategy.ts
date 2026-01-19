import * as fs from 'node:fs';
import * as path from 'node:path';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ENVS } from '@/config/envs.config';

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
    // Validar que el usuario tenga acceso a al menos un sistema permitido
    const tieneAcceso = payload.systems.some((sistema) => ENVS.sistemasPermitidos.includes(sistema));

    if (!tieneAcceso) {
      const sistemasNoPermitidos = payload.systems.filter((sistema) => !ENVS.sistemasPermitidos.includes(sistema));
      const count = sistemasNoPermitidos.length;
      const sistemaText = count === 1 ? 'sistema' : 'sistemas';
      const articulo = count === 1 ? 'al' : 'a los';
      throw new UnauthorizedException(`Lo sentimos, no tienes permisos para acceder ${articulo} ${sistemaText}: ${sistemasNoPermitidos.join(', ')}`);
    }

    return {
      idUsuario: payload.userId,
      idSistemaUsuario: payload.userSystemId,
      nroDocumento: payload.nroDocumento,
      idSessionActiva: payload.sid,
      rol: payload.role,
      sistemasPermitidos: payload.systems,
    };
  }
}
