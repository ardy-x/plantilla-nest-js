import { HttpService } from '@nestjs/axios';
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { ENV_VARS } from '@/config/envs.config';
import type { IntercambioCodigoDatos, KerberosApiResponse, RefreshTokenDatos } from './tipos/kerberos-api-response.interface';
import { KERBEROS_ENDPOINTS } from './tipos/kerberos-endpoints';

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
    const url = `${this.kerberosUrl}${KERBEROS_ENDPOINTS.EXCHANGE_CODE}`;
    try {
      const response = await firstValueFrom(this.httpService.post<KerberosApiResponse<IntercambioCodigoDatos>>(url, { code }));
      this.logger.log('Intercambio exitoso, token recibido');
      return response.data.data!;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.message;
        this.logger.error(`Error en intercambioCodigo - Status: ${status}, Mensaje: ${message}`);
        if (status === 400) {
          throw new BadRequestException(`Código de autenticación inválido: ${code}`);
        } else if (status === 403) {
          throw new ForbiddenException('Código de autenticación expirado o ya utilizado');
        } else {
          throw new InternalServerErrorException(`Error en el servidor de Kerberos: ${status}`);
        }
      } else {
        this.logger.error(`Error en intercambioCodigo - Sin respuesta: ${error.message}`);
        throw new ServiceUnavailableException('Error de conexión con el servidor de Kerberos');
      }
    }
  }

  async cierreSesionSistema(idSistema: string, accessToken: string): Promise<void> {
    const url = `${this.kerberosUrl}${KERBEROS_ENDPOINTS.SYSTEM_LOGOUT}`;
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
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.message;
        this.logger.error(`Error en cierreSesionSistema - Status: ${status}, Mensaje: ${message}`);
        if (status === 401) {
          throw new BadRequestException('Token de autenticación expirado');
        } else {
          throw new InternalServerErrorException(`Error en el servidor de Kerberos: ${status}`);
        }
      } else {
        this.logger.error(`Error en cierreSesionSistema - Sin respuesta: ${error.message}`);
        throw new ServiceUnavailableException('Error de conexión con el servidor de Kerberos');
      }
    }
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const url = `${this.kerberosUrl}${KERBEROS_ENDPOINTS.REFRESH}`;
    try {
      const response = await firstValueFrom(
        this.httpService.get<KerberosApiResponse<RefreshTokenDatos>>(url, {
          headers: { Authorization: `Refresh ${refreshToken}` },
        }),
      );
      this.logger.log('Refresh token exitoso');
      return response.data.data!;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.message;
        this.logger.error(`Error en refreshToken - Status: ${status}, Mensaje: ${message}`);
        if (status === 401) {
          throw new BadRequestException('Tu sesión ha expirado completamente. Por favor, inicia sesión nuevamente');
        } else {
          throw new InternalServerErrorException(`Error en el servidor de Kerberos: ${status}`);
        }
      } else {
        this.logger.error(`Error en refreshToken - Sin respuesta: ${error.message}`);
        throw new ServiceUnavailableException('Error de conexión con el servidor de Kerberos');
      }
    }
  }
}
