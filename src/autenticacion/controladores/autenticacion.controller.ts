import { Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import type { DecodificarTokenResponseDto } from '../dtos/salida/decodificar-token-response.dto';
import { KerberosService } from '../servicios/kerberos.service';

@ApiTags('autenticacion')
@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly kerberosService: KerberosService) {}

  @Post('intercambio-codigo/:codigo')
  @ApiOperation({ summary: 'Intercambio de código' })
  async decodificarToken(@Param('codigo', ParseUUIDPipe) codigo: string): Promise<DecodificarTokenResponseDto> {
    const datos = await this.kerberosService.decodificarToken(codigo);
    return RespuestaBuilder.exito(200, 'Token decodificado exitosamente', datos) as DecodificarTokenResponseDto;
  }
}
