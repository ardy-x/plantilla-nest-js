import type { RespuestaBaseDto } from '../dto/respuesta-base.dto';

export class RespuestaBuilder {
  static exito<T = void>(codigo: number, mensaje: string, datos?: T): RespuestaBaseDto<T> {
    return {
      error: false,
      status: codigo,
      message: mensaje,
      response: datos || null,
    };
  }

  static error(codigo: number, mensaje: string): RespuestaBaseDto {
    return {
      error: true,
      status: codigo,
      message: mensaje,
      response: null,
    };
  }
}
