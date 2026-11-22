import { decodeBase64 } from './base64.util.js';

describe('decodeBase64', () => {
  it.each(['aGVsbG8=', 'aGk=', 'YWJj', 'Kw=='])(
    'decodes valid base64 %s',
    (value) => {
      expect(decodeBase64(value).toString('base64')).toBe(value);
    },
  );

  it.each([
    ['empty string', ''],
    ['invalid characters', 'aGVs!G8='],
    ['missing padding', 'aGk'],
    ['whitespace', 'aGVs bG8='],
    ['url-safe alphabet', 'a-_b'],
  ])('rejects %s', (_name, value) => {
    expect(() => decodeBase64(value)).toThrow('Value is not valid base64');
  });
});
