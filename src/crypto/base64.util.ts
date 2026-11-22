const BASE64_PATTERN =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

/**
 * Decodes standard, padded base64. Throws on anything else, because
 * `Buffer.from(value, 'base64')` silently skips invalid characters.
 */
export function decodeBase64(value: string): Buffer {
  if (value.length === 0 || !BASE64_PATTERN.test(value)) {
    throw new Error('Value is not valid base64');
  }
  return Buffer.from(value, 'base64');
}
