import { createPrivateKey, createPublicKey, KeyObject } from 'node:crypto';

export interface EnvConfig {
  PORT: number;
  PRIVATE_KEY: string;
  PUBLIC_KEY: string;
}

const DEFAULT_PORT = 3000;

/**
 * Validates environment variables when the app starts. Throws one error listing
 * every problem, so a bad configuration stops the service before it serves traffic.
 * Key contents are never included in error messages.
 */
export function validateEnv(raw: Record<string, unknown>): EnvConfig {
  const errors: string[] = [];

  const port = parsePort(raw.PORT, errors);
  const privateKey = parseKey(
    'PRIVATE_KEY',
    raw.PRIVATE_KEY,
    createPrivateKey,
    errors,
  );
  const publicKey = parseKey(
    'PUBLIC_KEY',
    raw.PUBLIC_KEY,
    createPublicKey,
    errors,
  );

  if (privateKey && publicKey && !isSamePair(privateKey, publicKey)) {
    errors.push('PUBLIC_KEY does not belong to PRIVATE_KEY');
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n  - ${errors.join('\n  - ')}`,
    );
  }

  return {
    PORT: port,
    PRIVATE_KEY: raw.PRIVATE_KEY as string,
    PUBLIC_KEY: raw.PUBLIC_KEY as string,
  };
}

function parsePort(value: unknown, errors: string[]): number {
  if (value === undefined || value === '') {
    return DEFAULT_PORT;
  }
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push('PORT must be an integer between 1 and 65535');
  }
  return port;
}

function parseKey(
  name: string,
  value: unknown,
  create: (pem: string) => KeyObject,
  errors: string[],
): KeyObject | undefined {
  if (typeof value !== 'string' || value.trim() === '') {
    errors.push(`${name} is required`);
    return undefined;
  }
  try {
    const key = create(value);
    if (key.asymmetricKeyType !== 'rsa') {
      errors.push(`${name} must be an RSA key`);
      return undefined;
    }
    return key;
  } catch {
    errors.push(`${name} is not a valid PEM key`);
    return undefined;
  }
}

function isSamePair(privateKey: KeyObject, publicKey: KeyObject): boolean {
  const fromPrivate = createPublicKey(privateKey).export({
    type: 'spki',
    format: 'der',
  });
  const given = publicKey.export({ type: 'spki', format: 'der' });
  return fromPrivate.equals(given);
}
