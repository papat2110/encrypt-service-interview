import { generateKeyPairSync } from 'node:crypto';
import { validateEnv } from './env.validation.js';

const validKeys = {
  PRIVATE_KEY: process.env.PRIVATE_KEY as string,
  PUBLIC_KEY: process.env.PUBLIC_KEY as string,
};

describe('validateEnv', () => {
  it('accepts the demo configuration and defaults PORT to 3000', () => {
    expect(validateEnv({ ...validKeys })).toEqual({ ...validKeys, PORT: 3000 });
  });

  it('parses PORT as a number', () => {
    expect(validateEnv({ ...validKeys, PORT: '8080' }).PORT).toBe(8080);
  });

  it('rejects an invalid PORT', () => {
    expect(() => validateEnv({ ...validKeys, PORT: 'abc' })).toThrow(
      /PORT must be/,
    );
  });

  it('lists every missing key in one error', () => {
    expect(() => validateEnv({})).toThrow(
      /PRIVATE_KEY is required[\s\S]*PUBLIC_KEY is required/,
    );
  });

  it('rejects a value that is not a PEM key', () => {
    expect(() =>
      validateEnv({ ...validKeys, PRIVATE_KEY: 'not-a-key' }),
    ).toThrow(/PRIVATE_KEY is not a valid PEM key/);
  });

  it('rejects a public key from a different pair', () => {
    const other = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const otherPublic = other.publicKey.export({
      type: 'spki',
      format: 'pem',
    }) as string;
    expect(() =>
      validateEnv({ ...validKeys, PUBLIC_KEY: otherPublic }),
    ).toThrow(/PUBLIC_KEY does not belong to PRIVATE_KEY/);
  });

  it('never puts key contents in the error message', () => {
    try {
      validateEnv({ ...validKeys, PUBLIC_KEY: 'broken' });
    } catch (error) {
      expect((error as Error).message).not.toContain('BEGIN');
    }
  });
});
