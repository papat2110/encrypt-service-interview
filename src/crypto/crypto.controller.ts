import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { type ApiResult, success } from '../common/api-result.js';
import {
  CryptoService,
  type DecryptedData,
  type EncryptedData,
} from './crypto.service.js';
import {
  DecryptResponseDto,
  EncryptResponseDto,
  ErrorResponseDto,
} from './dto/crypto-response.dto.js';
import { DecryptRequestDto } from './dto/decrypt-request.dto.js';
import { EncryptRequestDto } from './dto/encrypt-request.dto.js';

@ApiTags('crypto')
@ApiInternalServerErrorResponse({
  description: 'Unexpected error (`INTERNAL_ERROR`)',
  type: ErrorResponseDto,
})
@Controller()
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Post('get-encrypt-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Encrypt a payload',
    description:
      'Generates a random AES-256 key, encrypts the payload with it (data2), ' +
      'then encrypts the AES key with the RSA private key (data1).',
  })
  @ApiOkResponse({ type: EncryptResponseDto })
  @ApiBadRequestResponse({
    description:
      'payload is missing, not a string, or longer than 2000 characters (`INVALID_REQUEST`)',
    type: ErrorResponseDto,
  })
  encrypt(@Body() body: EncryptRequestDto): ApiResult<EncryptedData> {
    return success(this.cryptoService.encrypt(body.payload));
  }

  @Post('get-decrypt-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Decrypt data1 and data2 back to the payload',
    description:
      'Decrypts data1 with the RSA public key to get the AES key, ' +
      'then decrypts data2 with that AES key to get the payload.',
  })
  @ApiOkResponse({ type: DecryptResponseDto })
  @ApiBadRequestResponse({
    description:
      '`INVALID_REQUEST`: data1 or data2 is missing or not a non-empty string. ' +
      '`INVALID_DATA1`: data1 cannot be decrypted. ' +
      '`INVALID_DATA2`: data2 cannot be decrypted or was modified.',
    type: ErrorResponseDto,
  })
  decrypt(@Body() body: DecryptRequestDto): ApiResult<DecryptedData> {
    return success(this.cryptoService.decrypt(body.data1, body.data2));
  }
}
