import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, MaxLength } from 'class-validator';

export const PAYLOAD_MAX_LENGTH = 2000;

export class EncryptRequestDto {
  @ApiProperty({
    description: 'Text to encrypt. Required, but may be an empty string.',
    minLength: 0,
    maxLength: PAYLOAD_MAX_LENGTH,
    example: 'Hello, World!',
  })
  @IsDefined()
  @IsString()
  @MaxLength(PAYLOAD_MAX_LENGTH)
  payload: string;
}
