import { type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decoradores/public.decorator';

@Injectable()
export class KerberosJwtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  // biome-ignore lint/suspicious/noExplicitAny: Firma requerida por AuthGuard de @nestjs/passport
  handleRequest<TUser = any>(err: any, user: any, info: any, _context: ExecutionContext, _status?: any): TUser {
    switch (info?.message) {
      case 'No auth token':
        throw new UnauthorizedException('Token de autenticación no proporcionado');
      case 'jwt expired':
        throw new UnauthorizedException('Token de autenticación expirado');
      case 'invalid token':
        throw new UnauthorizedException('Token de autenticación inválido');
    }

    if (err || !user) {
      throw new UnauthorizedException(err?.message || 'Error de autenticación');
    }

    return user;
  }
}
