import { IsUUID } from 'class-validator';

export class CierreSesionSistemaRequestDto {
  @IsUUID()
  idSistema: string;
}
