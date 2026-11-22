import { failure, success } from './api-result.js';
import { ErrorCode } from './error-code.enum.js';

describe('ApiResult helpers', () => {
  it('success wraps data with an empty error_code', () => {
    expect(success({ payload: 'x' })).toEqual({
      successful: true,
      error_code: '',
      data: { payload: 'x' },
    });
  });

  it('failure returns null data', () => {
    expect(failure(ErrorCode.INVALID_REQUEST)).toEqual({
      successful: false,
      error_code: 'INVALID_REQUEST',
      data: null,
    });
  });
});
