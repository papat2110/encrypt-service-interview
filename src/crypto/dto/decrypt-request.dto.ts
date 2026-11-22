import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DecryptRequestDto {
  @ApiProperty({
    description:
      'AES key encrypted with the RSA private key (base64), from /get-encrypt-data.',
  })
  @IsString()
  @IsNotEmpty()
  data1: string;

  @ApiProperty({
    description:
      'Payload encrypted with the AES key (base64), from /get-encrypt-data.',
  })
  @IsString()
  @IsNotEmpty()
  data2: string;
}
