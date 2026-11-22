import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { setupSwagger } from './../src/swagger.js';

describe('Swagger (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    setupSwagger(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves the Swagger UI at /api-docs', async () => {
    const res = await request(app.getHttpServer()).get('/api-docs').expect(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('swagger-ui');
  });

  it('documents exactly the two POST APIs', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/api-docs-json')
      .expect(200);

    expect(Object.keys(body.paths).sort()).toEqual([
      '/get-decrypt-data',
      '/get-encrypt-data',
    ]);
    expect(Object.keys(body.paths['/get-encrypt-data'])).toEqual(['post']);
    expect(Object.keys(body.paths['/get-decrypt-data'])).toEqual(['post']);
  });

  it('describes the request bodies from the DTOs', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/api-docs-json')
      .expect(200);
    const schemas = body.components.schemas;

    expect(schemas.EncryptRequestDto.required).toEqual(['payload']);
    expect(schemas.EncryptRequestDto.properties.payload).toMatchObject({
      type: 'string',
      minLength: 0,
      maxLength: 2000,
    });
    expect(schemas.DecryptRequestDto.required).toEqual(['data1', 'data2']);
  });

  it('documents 200 and 400 responses for each API', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/api-docs-json')
      .expect(200);

    for (const path of ['/get-encrypt-data', '/get-decrypt-data']) {
      expect(Object.keys(body.paths[path].post.responses)).toEqual(
        expect.arrayContaining(['200', '400', '500']),
      );
    }
  });
});
