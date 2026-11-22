/**
 * Values returned in the `error_code` field of every response.
 * An empty string means the request succeeded.
 */
export enum ErrorCode {
  NONE = '',
  INVALID_REQUEST = 'INVALID_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_DATA1 = 'INVALID_DATA1',
  INVALID_DATA2 = 'INVALID_DATA2',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
