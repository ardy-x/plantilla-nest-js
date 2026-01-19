import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { TokenActual } from '../decoradores/token-actual.decorator';
import { CierreSesionSistemaRequestDto } from '../dtos/entrada/cierre-sesion-sistema-request.dto';
import { DecodificarTokenRequestDto } from '../dtos/entrada/decodificar-token-request.dto';
import type { DecodificarTokenResponseDto } from '../dtos/salida/decodificar-token-response.dto';
import type { RefreshTokenResponseDto } from '../dtos/salida/refresh-token-response.dto';
import { KerberosJwtGuard } from '../guardias/kerberos-jwt.guard';
import { KerberosService } from '../servicios/kerberos.service';

@ApiTags('autenticacion')
@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly kerberosService: KerberosService) {}

  @Post('intercambio-codigo')
  @ApiOperation({ summary: 'Intercambio de código' })
  async decodificarToken(@Body() dto: DecodificarTokenRequestDto): Promise<DecodificarTokenResponseDto> {
    const datos = await this.kerberosService.decodificarToken(dto.codigo);
    return RespuestaBuilder.exito(200, 'Token decodificado exitosamente', datos) as DecodificarTokenResponseDto;
  }

  @Post('cierre-sesion-sistema')
  @UseGuards(KerberosJwtGuard)
  @ApiOperation({ summary: 'Termina la sesión del usuario en el sistema' })
  async cierreSesionSistema(@Body() dto: CierreSesionSistemaRequestDto, @TokenActual() accessToken: string): Promise<RespuestaBaseDto<void>> {
    await this.kerberosService.cierreSesionSistema(dto.idSistema, accessToken);
    return RespuestaBuilder.exito(200, 'Cierre de sesión del sistema completado exitosamente');
  }

  @Get('refresh')
  @UseGuards(KerberosJwtGuard)
  @ApiOperation({ summary: 'Renovar tokens' })
  async refreshToken(@TokenActual() accessToken: string): Promise<RespuestaBaseDto<RefreshTokenResponseDto>> {
    const datos = await this.kerberosService.refreshToken(accessToken);
    return RespuestaBuilder.exito(200, 'Renovación de tokens exitosa', datos);
  }
}
