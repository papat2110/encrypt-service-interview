import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { failure } from './api-result.js';
import { AppException } from './app.exception.js';
import { ErrorCode } from './error-code.enum.js';

/**
 * Turns every error into the standard response envelope, so clients always get
 * `{ successful: false, error_code, data: null }` and never a stack trace.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, errorCode } = this.resolve(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        exception instanceof Error ? exception.message : String(exception),
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json(failure(errorCode));
  }

  private resolve(exception: unknown): {
    status: number;
    errorCode: ErrorCode;
  } {
    if (exception instanceof AppException) {
      return { status: exception.getStatus(), errorCode: exception.errorCode };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status === HttpStatus.NOT_FOUND) {
        return { status, errorCode: ErrorCode.NOT_FOUND };
      }
      if (status < HttpStatus.INTERNAL_SERVER_ERROR) {
        return { status, errorCode: ErrorCode.INVALID_REQUEST };
      }
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: ErrorCode.INTERNAL_ERROR,
    };
  }
}
