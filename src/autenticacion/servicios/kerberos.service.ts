import * as fs from 'node:fs';
import * as path from 'node:path';
import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { KerberosApi } from '../apis/kerberos.api';
import type { DecodificarTokenDatosDto } from '../dtos/salida/decodificar-token-response.dto';
import type { CodigoDecodificado } from '../tipos/codigo-decodificado';
import { TraductorDatosService } from './traductor-datos.service';

@Injectable()
export class KerberosService {
  private readonly logger = new Logger(KerberosService.name);
  private publicKey: string;

  constructor(
    private readonly kerberosApi: KerberosApi,
    private readonly traductorDatosService: TraductorDatosService,
  ) {
    this.publicKey = fs.readFileSync(path.join(process.cwd(), 'keys', 'public.pem'), 'utf8');
  }

  async decodificarToken(codigo: string): Promise<DecodificarTokenDatosDto> {
    try {
      const intercambioCodigo = await this.kerberosApi.intercambioCodigo(codigo);
      const token = intercambioCodigo.token;
      const decodificar = jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
      }) as CodigoDecodificado;
      if (!decodificar.systemData || !decodificar.userData || !decodificar.tokens) {
        throw new BadRequestException('Datos obligatorios faltan en el token JWT');
      }
      this.logger.log(`Token decodificado exitosamente para usuario: ${decodificar.userData.username || decodificar.userData.userId}`);
      const datosTraducidos = this.traductorDatosService.traducirDatos(decodificar);
      return datosTraducidos;
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token JWT inválido');
      }
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token JWT expirado');
      }
      throw error;
    }
  }
}
