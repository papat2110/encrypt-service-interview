import { Module } from '@nestjs/common';
import { CryptoController } from './crypto.controller.js';
import { CryptoService } from './crypto.service.js';
import { rsaKeysProvider } from './rsa-keys.provider.js';

@Module({
  controllers: [CryptoController],
  providers: [rsaKeysProvider, CryptoService],
})
export class CryptoModule {}
