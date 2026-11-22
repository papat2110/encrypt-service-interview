import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('returns the error envelope for an unknown route', () => {
    return request(app.getHttpServer())
      .post('/does-not-exist')
      .expect(404)
      .expect({ successful: false, error_code: 'NOT_FOUND', data: null });
  });

  it('returns the error envelope for malformed JSON', () => {
    return request(app.getHttpServer())
      .post('/does-not-exist')
      .set('Content-Type', 'application/json')
      .send('{"payload":')
      .expect(400)
      .expect({ successful: false, error_code: 'INVALID_REQUEST', data: null });
  });
});
