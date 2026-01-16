import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { KerberosApi } from './apis/kerberos.api';
import { AutenticacionController } from './controladores/autenticacion.controller';
import { KerberosJwtStrategy } from './estrategias/kerberos-jwt.strategy';
import { RolesGuard } from './guardias/roles.guard';
import { KerberosService } from './servicios/kerberos.service';
import { TraductorDatosService } from './servicios/traductor-datos.service';

@Module({
  imports: [HttpModule, PassportModule],
  controllers: [AutenticacionController],
  providers: [KerberosService, KerberosApi, TraductorDatosService, KerberosJwtStrategy, RolesGuard],
})
export class AutenticacionModule {}
