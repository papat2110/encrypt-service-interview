import {
  constants,
  KeyObject,
  privateEncrypt,
  publicDecrypt,
} from 'node:crypto';
import { decodeBase64 } from './base64.util.js';

// privateEncrypt/publicDecrypt only support PKCS#1 v1.5 padding (OAEP is for
// publicEncrypt/privateDecrypt), so this is the padding the spec's direction allows.
const PADDING = constants.RSA_PKCS1_PADDING;

/** Encrypts data with the RSA private key. Returns base64. */
export function rsaPrivateEncrypt(data: Buffer, privateKey: KeyObject): string {
  return privateEncrypt({ key: privateKey, padding: PADDING }, data).toString(
    'base64',
  );
}

/** Decrypts base64 data produced by {@link rsaPrivateEncrypt} using the RSA public key. */
export function rsaPublicDecrypt(
  encoded: string,
  publicKey: KeyObject,
): Buffer {
  return publicDecrypt(
    { key: publicKey, padding: PADDING },
    decodeBase64(encoded),
  );
}
