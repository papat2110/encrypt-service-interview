import { ErrorCode } from './error-code.enum.js';

/** Envelope shared by every API response. */
export interface ApiResult<T> {
  successful: boolean;
  error_code: ErrorCode;
  data: T | null;
}

export function success<T>(data: T): ApiResult<T> {
  return { successful: true, error_code: ErrorCode.NONE, data };
}

export function failure(errorCode: ErrorCode): ApiResult<null> {
  return { successful: false, error_code: errorCode, data: null };
}
