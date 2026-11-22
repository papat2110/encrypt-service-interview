import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

const error = (error_code: string) => ({
  successful: false,
  error_code,
  data: null,
});

describe('Encrypt service (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const encrypt = (body: unknown) =>
    request(app.getHttpServer())
      .post('/get-encrypt-data')
      .send(body as object);
  const decrypt = (body: unknown) =>
    request(app.getHttpServer())
      .post('/get-decrypt-data')
      .send(body as object);

  describe('POST /get-encrypt-data', () => {
    it('returns 200 with data1 and data2', async () => {
      const res = await encrypt({ payload: 'hello' }).expect(200);

      expect(res.body).toEqual({
        successful: true,
        error_code: '',
        data: { data1: expect.any(String), data2: expect.any(String) },
      });
    });

    it.each([
      ['empty string', ''],
      ['exactly 2000 characters', 'a'.repeat(2000)],
    ])('accepts payload: %s', async (_name, payload) => {
      await encrypt({ payload }).expect(200);
    });

    it.each([
      ['missing payload', {}],
      ['null payload', { payload: null }],
      ['number payload', { payload: 123 }],
      ['object payload', { payload: { a: 1 } }],
      ['2001 characters', { payload: 'a'.repeat(2001) }],
    ])('rejects %s with INVALID_REQUEST', async (_name, body) => {
      await encrypt(body).expect(400).expect(error('INVALID_REQUEST'));
    });
  });

  describe('POST /get-decrypt-data', () => {
    it.each([
      ['ascii', 'hello world'],
      ['empty string', ''],
      ['thai and emoji', 'สวัสดี 🔐'],
      ['2000 characters', 'z'.repeat(2000)],
    ])('round-trips %s through both endpoints', async (_name, payload) => {
      const encrypted = await encrypt({ payload }).expect(200);

      await decrypt(encrypted.body.data)
        .expect(200)
        .expect({ successful: true, error_code: '', data: { payload } });
    });

    it.each([
      ['missing data1', { data2: 'abc=' }],
      ['missing data2', { data1: 'abc=' }],
      ['empty data1', { data1: '', data2: 'abc=' }],
      ['number data2', { data1: 'abc=', data2: 1 }],
    ])('rejects %s with INVALID_REQUEST', async (_name, body) => {
      await decrypt(body).expect(400).expect(error('INVALID_REQUEST'));
    });

    it('returns INVALID_DATA1 when data1 cannot be decrypted', async () => {
      const { body } = await encrypt({ payload: 'x' });
      await decrypt({ data1: 'bm90LWEta2V5', data2: body.data.data2 })
        .expect(400)
        .expect(error('INVALID_DATA1'));
    });

    it('returns INVALID_DATA2 when data2 was modified', async () => {
      const { body } = await encrypt({ payload: 'secret' });
      const bytes = Buffer.from(body.data.data2 as string, 'base64');
      bytes[bytes.length - 1] ^= 0x01;

      await decrypt({ data1: body.data.data1, data2: bytes.toString('base64') })
        .expect(400)
        .expect(error('INVALID_DATA2'));
    });
  });

  describe('error envelope', () => {
    it('unknown route returns NOT_FOUND', async () => {
      await request(app.getHttpServer())
        .get('/')
        .expect(404)
        .expect(error('NOT_FOUND'));
    });

    it('wrong HTTP method returns NOT_FOUND', async () => {
      await request(app.getHttpServer())
        .get('/get-encrypt-data')
        .expect(404)
        .expect(error('NOT_FOUND'));
    });

    it('malformed JSON returns INVALID_REQUEST', async () => {
      await request(app.getHttpServer())
        .post('/get-encrypt-data')
        .set('Content-Type', 'application/json')
        .send('{"payload":')
        .expect(400)
        .expect(error('INVALID_REQUEST'));
    });

    it('a JSON array body returns INVALID_REQUEST', async () => {
      await encrypt([{ payload: 'x' }])
        .expect(400)
        .expect(error('INVALID_REQUEST'));
    });
  });
});
