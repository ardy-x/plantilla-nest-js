import { HttpService } from '@nestjs/axios';
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { ENV_VARS } from '@/config/envs.config';
@Injectable()
export class KerberosApi {
  private readonly logger = new Logger(KerberosApi.name);
  private readonly kerberosUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<ENV_VARS, true>,
  ) {
    this.kerberosUrl = this.configService.get('KERBEROS_API_BASE', {
      infer: true,
    });
  }

  async intercambioCodigo(code: string): Promise<{ token: string }> {
    const url = `${this.kerberosUrl}/auth/exchange-code`;
    try {
      const response = await firstValueFrom(this.httpService.post(url, { code }));
      this.logger.log('Intercambio exitoso, token recibido');
      return response.data.data;
    } catch (error) {
      this.logger.error(`Error en intercambioCodigo: ${error.message}`);
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          throw new BadRequestException(`Código de autenticación inválido: ${code}`);
        } else if (status === 403) {
          throw new ForbiddenException('Código de autenticación expirado o ya utilizado');
        } else {
          throw new InternalServerErrorException(`Error en el servidor de Kerberos: ${status}`);
        }
      } else {
        throw new ServiceUnavailableException('Error de conexión con el servidor de Kerberos');
      }
    }
  }

  async cierreSesionSistema(idSistema: string, accessToken: string): Promise<void> {
    const url = `${this.kerberosUrl}/auth/system-logout`;
    try {
      await firstValueFrom(
        this.httpService.post(
          url,
          { systemId: idSistema },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );
      this.logger.log('Cierre de sesión del sistema exitoso');
    } catch (error) {
      this.logger.error(`Error en cierreSesionSistema: ${error.message}`);
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          throw new BadRequestException('Token de autenticación expirado');
        } else {
          throw new InternalServerErrorException(`Error en el servidor de Kerberos: ${status}`);
        }
      } else {
        throw new ServiceUnavailableException('Error de conexión con el servidor de Kerberos');
      }
    }
  }

  async refreshToken(accessToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const url = `${this.kerberosUrl}/auth/refresh`;
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      this.logger.log('Refresh token exitoso');
      return response.data.data;
    } catch (error) {
      this.logger.error(`Error en refreshToken: ${error.message}`);
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          throw new BadRequestException('Token de autenticación expirado o inválido');
        } else {
          throw new InternalServerErrorException(`Error en el servidor de Kerberos: ${status}`);
        }
      } else {
        throw new ServiceUnavailableException('Error de conexión con el servidor de Kerberos');
      }
    }
  }
}
