import { HttpService } from '@nestjs/axios';
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { EnvVars } from '@/config/envs.config';
@Injectable()
export class KerberosApi {
  private readonly logger = new Logger(KerberosApi.name);
  private readonly kerberosUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<EnvVars, true>,
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
}
