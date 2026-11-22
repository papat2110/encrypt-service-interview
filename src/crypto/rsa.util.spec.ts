import {
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  randomBytes,
} from 'node:crypto';
import { rsaPrivateEncrypt, rsaPublicDecrypt } from './rsa.util.js';

describe('RSA utilities', () => {
  const privateKey = createPrivateKey(process.env.PRIVATE_KEY as string);
  const publicKey = createPublicKey(process.env.PUBLIC_KEY as string);

  it('encrypts with the private key and decrypts with the public key', () => {
    const data = randomBytes(32);
    expect(
      rsaPublicDecrypt(rsaPrivateEncrypt(data, privateKey), publicKey).equals(
        data,
      ),
    ).toBe(true);
  });

  it('outputs base64 of exactly one RSA block (key size in bytes)', () => {
    const keyBytes = (privateKey.asymmetricKeyDetails?.modulusLength ?? 0) / 8;
    expect(
      Buffer.from(rsaPrivateEncrypt(randomBytes(32), privateKey), 'base64'),
    ).toHaveLength(keyBytes);
  });

  it('fails with a public key from a different pair', () => {
    const other = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const encrypted = rsaPrivateEncrypt(randomBytes(32), privateKey);
    expect(() => rsaPublicDecrypt(encrypted, other.publicKey)).toThrow();
  });

  it('fails when the data is modified', () => {
    const bytes = Buffer.from(
      rsaPrivateEncrypt(randomBytes(32), privateKey),
      'base64',
    );
    bytes[10] ^= 0x01;
    expect(() =>
      rsaPublicDecrypt(bytes.toString('base64'), publicKey),
    ).toThrow();
  });

  it('fails on invalid base64', () => {
    expect(() => rsaPublicDecrypt('###', publicKey)).toThrow(
      'Value is not valid base64',
    );
  });
});
