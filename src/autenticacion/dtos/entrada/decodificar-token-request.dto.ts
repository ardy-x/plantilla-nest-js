import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class DecodificarTokenRequestDto {
  @ApiProperty()
  @IsUUID()
  codigo: string;
}
