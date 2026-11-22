import {
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter.js';
import { AppException } from './app.exception.js';
import { ErrorCode } from './error-code.enum.js';

function mockHost() {
  const response = { status: vi.fn(), json: vi.fn() };
  response.status.mockReturnValue(response);
  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;
  return { host, response };
}

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  beforeEach(() => {
    // Keep expected 5xx error logs out of the test output.
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it.each([
    [
      'AppException',
      new AppException(ErrorCode.INVALID_DATA1),
      400,
      ErrorCode.INVALID_DATA1,
    ],
    [
      'AppException with custom status',
      new AppException(
        ErrorCode.INVALID_DATA2,
        HttpStatus.UNPROCESSABLE_ENTITY,
      ),
      422,
      ErrorCode.INVALID_DATA2,
    ],
    [
      'validation error',
      new BadRequestException(['payload must be a string']),
      400,
      ErrorCode.INVALID_REQUEST,
    ],
    ['unknown route', new NotFoundException(), 404, ErrorCode.NOT_FOUND],
    [
      '5xx HttpException',
      new ServiceUnavailableException(),
      500,
      ErrorCode.INTERNAL_ERROR,
    ],
    ['plain Error', new Error('boom'), 500, ErrorCode.INTERNAL_ERROR],
    ['non-Error value', 'oops', 500, ErrorCode.INTERNAL_ERROR],
  ])('maps %s to %i %s', (_name, exception, status, errorCode) => {
    const { host, response } = mockHost();

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(status);
    expect(response.json).toHaveBeenCalledWith({
      successful: false,
      error_code: errorCode,
      data: null,
    });
  });
});
