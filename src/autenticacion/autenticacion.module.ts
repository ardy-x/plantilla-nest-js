import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { KerberosApi } from './apis/kerberos.api';
import { AutenticacionController } from './controladores/autenticacion.controller';
import { RolesGuard } from './guards/roles.guard';
import { KerberosService } from './servicios/kerberos.service';
import { TraductorDatosService } from './servicios/traductor-datos.service';
import { KerberosJwtStrategy } from './strategies/kerberos-jwt.strategy';

@Module({
  imports: [HttpModule, PassportModule],
  controllers: [AutenticacionController],
  providers: [KerberosService, KerberosApi, TraductorDatosService, KerberosJwtStrategy, RolesGuard],
})
export class AutenticacionModule {}
