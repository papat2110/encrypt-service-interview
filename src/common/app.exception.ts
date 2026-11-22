import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-code.enum.js';

/** Thrown by application code to fail a request with a specific error code. */
export class AppException extends HttpException {
  constructor(
    readonly errorCode: ErrorCode,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    options?: { cause?: unknown },
  ) {
    super(errorCode, status, options);
  }
}
