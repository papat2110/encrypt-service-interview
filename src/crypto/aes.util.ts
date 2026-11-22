import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { decodeBase64 } from './base64.util.js';

const ALGORITHM = 'aes-256-gcm';
export const AES_KEY_LENGTH = 32; // 256-bit key
const IV_LENGTH = 12; // recommended IV size for GCM
const AUTH_TAG_LENGTH = 16;

/** Generates a new random AES-256 key. */
export function generateAesKey(): Buffer {
  return randomBytes(AES_KEY_LENGTH);
}

/**
 * Encrypts UTF-8 text with AES-256-GCM using a fresh random IV.
 * Returns base64 of `iv (12 bytes) | auth tag (16 bytes) | ciphertext`.
 */
export function aesEncrypt(plaintext: string, key: Buffer): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString(
    'base64',
  );
}

/**
 * Reverses {@link aesEncrypt}. Throws if the input is malformed, the key is
 * wrong, or the data was modified (the GCM auth tag check fails).
 */
export function aesDecrypt(encoded: string, key: Buffer): string {
  const data = decodeBase64(encoded);
  if (data.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Encrypted data is too short');
  }
  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
}
