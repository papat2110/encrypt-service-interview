import { ApiProperty } from '@nestjs/swagger';
import { ErrorCode } from '../../common/error-code.enum.js';

export class EncryptedDataDto {
  @ApiProperty({
    description: 'AES key encrypted with the RSA private key (base64)',
  })
  data1: string;

  @ApiProperty({
    description:
      'Payload encrypted with AES-256-GCM: base64(iv | auth tag | ciphertext)',
  })
  data2: string;
}

export class DecryptedDataDto {
  @ApiProperty({
    description: 'The original payload',
    example: 'Hello, World!',
  })
  payload: string;
}

abstract class BaseResponseDto {
  @ApiProperty({ description: 'Whether the request succeeded' })
  successful: boolean;

  @ApiProperty({
    enum: ErrorCode,
    description:
      'Empty string on success, otherwise the reason for the failure',
  })
  error_code: ErrorCode;
}

export class EncryptResponseDto extends BaseResponseDto {
  @ApiProperty({ type: EncryptedDataDto, nullable: true })
  data: EncryptedDataDto | null;
}

export class DecryptResponseDto extends BaseResponseDto {
  @ApiProperty({ type: DecryptedDataDto, nullable: true })
  data: DecryptedDataDto | null;
}

export class ErrorResponseDto extends BaseResponseDto {
  @ApiProperty({ type: 'null', nullable: true, example: null })
  data: null;
}
