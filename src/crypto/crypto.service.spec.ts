import { createPrivateKey, createPublicKey, randomBytes } from 'node:crypto';
import { Test } from '@nestjs/testing';
import { AppException } from '../common/app.exception.js';
import { ErrorCode } from '../common/error-code.enum.js';
import { aesEncrypt, generateAesKey } from './aes.util.js';
import { CryptoService } from './crypto.service.js';
import { RSA_KEYS, RsaKeys } from './rsa-keys.provider.js';
import { rsaPrivateEncrypt } from './rsa.util.js';

const keys: RsaKeys = {
  privateKey: createPrivateKey(process.env.PRIVATE_KEY as string),
  publicKey: createPublicKey(process.env.PUBLIC_KEY as string),
};

function expectErrorCode(fn: () => unknown, errorCode: ErrorCode): void {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(AppException);
    expect((error as AppException).errorCode).toBe(errorCode);
    expect((error as AppException).getStatus()).toBe(400);
    return;
  }
  throw new Error(`Expected AppException with ${errorCode}`);
}

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CryptoService, { provide: RSA_KEYS, useValue: keys }],
    }).compile();
    service = moduleRef.get(CryptoService);
  });

  it.each([
    ['empty string', ''],
    ['ascii', 'hello world'],
    ['thai', 'ข้อมูลลับ'],
    ['emoji', '🔐 secret 👍'],
    ['json text', JSON.stringify({ a: 1, b: [true, null] })],
    ['2000 characters', 'x'.repeat(2000)],
  ])('encrypt then decrypt returns the original %s', (_name, payload) => {
    const { data1, data2 } = service.encrypt(payload);
    expect(service.decrypt(data1, data2)).toEqual({ payload });
  });

  it('uses a new AES key and IV every call', () => {
    const first = service.encrypt('same payload');
    const second = service.encrypt('same payload');
    expect(first.data1).not.toBe(second.data1);
    expect(first.data2).not.toBe(second.data2);
  });

  it('data1 and data2 from different calls do not mix', () => {
    const first = service.encrypt('first');
    const second = service.encrypt('second');
    expectErrorCode(
      () => service.decrypt(first.data1, second.data2),
      ErrorCode.INVALID_DATA2,
    );
  });

  describe('INVALID_DATA1', () => {
    it('when data1 is not base64', () => {
      const { data2 } = service.encrypt('x');
      expectErrorCode(
        () => service.decrypt('***', data2),
        ErrorCode.INVALID_DATA1,
      );
    });

    it('when data1 was modified', () => {
      const { data1, data2 } = service.encrypt('x');
      const bytes = Buffer.from(data1, 'base64');
      bytes[0] ^= 0xff;
      expectErrorCode(
        () => service.decrypt(bytes.toString('base64'), data2),
        ErrorCode.INVALID_DATA1,
      );
    });

    it('when data1 decrypts to a key of the wrong length', () => {
      const data1 = rsaPrivateEncrypt(randomBytes(16), keys.privateKey);
      const { data2 } = service.encrypt('x');
      expectErrorCode(
        () => service.decrypt(data1, data2),
        ErrorCode.INVALID_DATA1,
      );
    });
  });

  describe('INVALID_DATA2', () => {
    it('when data2 is not base64', () => {
      const { data1 } = service.encrypt('x');
      expectErrorCode(
        () => service.decrypt(data1, 'not base64!'),
        ErrorCode.INVALID_DATA2,
      );
    });

    it('when data2 was modified', () => {
      const { data1, data2 } = service.encrypt('secret');
      const bytes = Buffer.from(data2, 'base64');
      bytes[bytes.length - 1] ^= 0x01;
      expectErrorCode(
        () => service.decrypt(data1, bytes.toString('base64')),
        ErrorCode.INVALID_DATA2,
      );
    });

    it('when data2 was encrypted with another AES key', () => {
      const { data1 } = service.encrypt('x');
      const data2 = aesEncrypt('x', generateAesKey());
      expectErrorCode(
        () => service.decrypt(data1, data2),
        ErrorCode.INVALID_DATA2,
      );
    });
  });
});
