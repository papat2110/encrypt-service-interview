import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_PATH = 'api-docs';

/** Serves the Swagger UI at /api-docs and the OpenAPI JSON at /api-docs-json. */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Encrypt Service')
    .setDescription(
      'Hybrid encryption API. `/get-encrypt-data` encrypts a payload with a random ' +
        'AES-256-GCM key and encrypts that key with the RSA private key. ' +
        '`/get-decrypt-data` reverses it with the RSA public key.\n\n' +
        'Every response uses the envelope `{ successful, error_code, data }`.',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    jsonDocumentUrl: `${SWAGGER_PATH}-json`,
  });
}
