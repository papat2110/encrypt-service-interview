import { createPrivateKey, createPublicKey, KeyObject } from 'node:crypto';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvConfig } from '../config/env.validation.js';

export const RSA_KEYS = Symbol('RSA_KEYS');

export interface RsaKeys {
  privateKey: KeyObject;
  publicKey: KeyObject;
}

/** Parses the PEM keys from config once, at startup (already validated by validateEnv). */
export const rsaKeysProvider: Provider<RsaKeys> = {
  provide: RSA_KEYS,
  inject: [ConfigService],
  useFactory: (config: ConfigService<EnvConfig, true>): RsaKeys => ({
    privateKey: createPrivateKey(config.get('PRIVATE_KEY', { infer: true })),
    publicKey: createPublicKey(config.get('PUBLIC_KEY', { infer: true })),
  }),
};
