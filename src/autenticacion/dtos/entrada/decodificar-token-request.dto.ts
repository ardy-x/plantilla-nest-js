import { IsUUID } from 'class-validator';

export class DecodificarTokenRequestDto {
  @IsUUID()
  codigo: string;
}
