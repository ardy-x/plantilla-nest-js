import { Injectable } from '@nestjs/common';
import type { DecodificarTokenDatosDto, ModuloDto } from '../dtos/salida/decodificar-token-response.dto';
import type { CodigoDecodificado } from '../tipos/codigo-decodificado';

type ModuloRaw = CodigoDecodificado['systemData']['modules'][0];

@Injectable()
export class TraductorDatosService {
  traducirModulo(modulo: ModuloRaw): ModuloDto {
    return {
      nombre: modulo.name,
      ruta: modulo.path,
      icono: modulo.icon,
      orden: modulo.order,
      submodulos: (modulo.children?.map(this.traducirModulo.bind(this)) as ModuloDto[]) || [],
    };
  }

  traducirDatos(decodificar: CodigoDecodificado): DecodificarTokenDatosDto {
    const sistema = decodificar.systemData;
    const usuario = decodificar.userData;

    if (!sistema.modules || !Array.isArray(sistema.modules)) {
      throw new Error('Módulos no encontrados o inválidos en systemData');
    }

    const modulos: ModuloDto[] = sistema.modules.map(this.traducirModulo.bind(this));

    return {
      tokens: {
        accessToken: decodificar.tokens.access_token,
        refreshToken: decodificar.tokens.refresh_token,
      },
      datosSistema: {
        id: sistema.id,
        modulos,
        permisos: sistema.permissions,
        rol: sistema.role,
      },
      datosUsuario: {
        idUsuario: usuario.userId,
        nombreUsuario: usuario.username,
        correo: usuario.email,
        activo: usuario.active,
        nombreCompleto: usuario.fullName,
        imagenUsuario: usuario.imageUser,
        verificado: usuario.verified,
        creadoEn: usuario.createdAt,
        ultimoAcceso: usuario.lastAccess,
        unidad: usuario.unidad,
        grado: usuario.grado,
        latitud: usuario.latitude,
        longitud: usuario.longitude,
      },
      iat: decodificar.iat,
      exp: decodificar.exp,
    };
  }
}
