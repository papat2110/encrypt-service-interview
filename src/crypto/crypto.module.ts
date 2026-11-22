import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service.js';
import { rsaKeysProvider } from './rsa-keys.provider.js';

@Module({
  providers: [rsaKeysProvider, CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}
