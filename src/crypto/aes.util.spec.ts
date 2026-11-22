import { aesDecrypt, aesEncrypt, generateAesKey } from './aes.util.js';

describe('AES-256-GCM utilities', () => {
  const key = generateAesKey();

  it('generates a 32-byte key that differs each time', () => {
    expect(key).toHaveLength(32);
    expect(generateAesKey().equals(key)).toBe(false);
  });

  it.each([
    ['empty string', ''],
    ['ascii', 'hello world'],
    ['thai', 'สวัสดีครับ'],
    ['emoji', '🔐👍'],
    ['2000 characters', 'a'.repeat(2000)],
  ])('round-trips %s', (_name, plaintext) => {
    expect(aesDecrypt(aesEncrypt(plaintext, key), key)).toBe(plaintext);
  });

  it('produces different output for the same input (random IV)', () => {
    expect(aesEncrypt('same', key)).not.toBe(aesEncrypt('same', key));
  });

  it('packs iv (12) + tag (16) + ciphertext into the output', () => {
    expect(Buffer.from(aesEncrypt('abc', key), 'base64')).toHaveLength(
      12 + 16 + 3,
    );
  });

  it('fails with the wrong key', () => {
    expect(() =>
      aesDecrypt(aesEncrypt('secret', key), generateAesKey()),
    ).toThrow();
  });

  it('fails when the ciphertext is modified', () => {
    const bytes = Buffer.from(aesEncrypt('secret', key), 'base64');
    bytes[bytes.length - 1] ^= 0x01;
    expect(() => aesDecrypt(bytes.toString('base64'), key)).toThrow();
  });

  it('fails when the data is too short', () => {
    expect(() => aesDecrypt(Buffer.alloc(27).toString('base64'), key)).toThrow(
      'Encrypted data is too short',
    );
  });

  it('fails on invalid base64', () => {
    expect(() => aesDecrypt('not base64!', key)).toThrow(
      'Value is not valid base64',
    );
  });
});
