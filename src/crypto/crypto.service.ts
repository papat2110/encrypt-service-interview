import { Inject, Injectable } from '@nestjs/common';
import { AppException } from '../common/app.exception.js';
import { ErrorCode } from '../common/error-code.enum.js';
import {
  AES_KEY_LENGTH,
  aesDecrypt,
  aesEncrypt,
  generateAesKey,
} from './aes.util.js';
import { RSA_KEYS, type RsaKeys } from './rsa-keys.provider.js';
import { rsaPrivateEncrypt, rsaPublicDecrypt } from './rsa.util.js';

export interface EncryptedData {
  data1: string;
  data2: string;
}

export interface DecryptedData {
  payload: string;
}

@Injectable()
export class CryptoService {
  constructor(@Inject(RSA_KEYS) private readonly keys: RsaKeys) {}

  /**
   * 1. Generate a random AES key.
   * 2. data2 = payload encrypted with that AES key.
   * 3. data1 = AES key encrypted with the RSA private key.
   */
  encrypt(payload: string): EncryptedData {
    const aesKey = generateAesKey();
    const data2 = aesEncrypt(payload, aesKey);
    const data1 = rsaPrivateEncrypt(aesKey, this.keys.privateKey);
    return { data1, data2 };
  }

  /**
   * 1. AES key = data1 decrypted with the RSA public key.
   * 2. payload = data2 decrypted with that AES key.
   */
  decrypt(data1: string, data2: string): DecryptedData {
    const aesKey = this.recoverAesKey(data1);
    try {
      return { payload: aesDecrypt(data2, aesKey) };
    } catch (error) {
      throw new AppException(ErrorCode.INVALID_DATA2, undefined, {
        cause: error,
      });
    }
  }

  private recoverAesKey(data1: string): Buffer {
    let aesKey: Buffer;
    try {
      aesKey = rsaPublicDecrypt(data1, this.keys.publicKey);
    } catch (error) {
      throw new AppException(ErrorCode.INVALID_DATA1, undefined, {
        cause: error,
      });
    }
    if (aesKey.length !== AES_KEY_LENGTH) {
      throw new AppException(ErrorCode.INVALID_DATA1);
    }
    return aesKey;
  }
}
