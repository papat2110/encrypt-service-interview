import { Test } from '@nestjs/testing';
import { AppException } from '../common/app.exception.js';
import { ErrorCode } from '../common/error-code.enum.js';
import { CryptoController } from './crypto.controller.js';
import { CryptoService } from './crypto.service.js';

describe('CryptoController', () => {
  let controller: CryptoController;
  const cryptoService = { encrypt: vi.fn(), decrypt: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [CryptoController],
      providers: [{ provide: CryptoService, useValue: cryptoService }],
    }).compile();
    controller = moduleRef.get(CryptoController);
  });

  it('encrypt wraps the service result in a success envelope', () => {
    cryptoService.encrypt.mockReturnValue({ data1: 'd1', data2: 'd2' });

    expect(controller.encrypt({ payload: 'hello' })).toEqual({
      successful: true,
      error_code: '',
      data: { data1: 'd1', data2: 'd2' },
    });
    expect(cryptoService.encrypt).toHaveBeenCalledWith('hello');
  });

  it('decrypt wraps the service result in a success envelope', () => {
    cryptoService.decrypt.mockReturnValue({ payload: 'hello' });

    expect(controller.decrypt({ data1: 'd1', data2: 'd2' })).toEqual({
      successful: true,
      error_code: '',
      data: { payload: 'hello' },
    });
    expect(cryptoService.decrypt).toHaveBeenCalledWith('d1', 'd2');
  });

  it('lets service errors through for the exception filter to handle', () => {
    cryptoService.decrypt.mockImplementation(() => {
      throw new AppException(ErrorCode.INVALID_DATA1);
    });

    expect(() => controller.decrypt({ data1: 'x', data2: 'y' })).toThrow(
      AppException,
    );
  });
});
