import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';
import { CORS_CONFIG } from './config/cors.config';
import { ENVS } from './config/envs.config';
import { SCALAR_CONFIG } from './config/scalar.config';
import { SWAGGER_CONFIG } from './config/swagger.config';
import { VALIDATION_PIPE_CONFIG } from './config/validation.config';
import { ExcepcionGlobalFilter } from './core/filtros/excepcion-global.filter';

async function bootstrap() {
  const logger = new Logger('Servicio Personal Policial');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors(CORS_CONFIG);

  app.useGlobalPipes(VALIDATION_PIPE_CONFIG);

  app.useGlobalFilters(new ExcepcionGlobalFilter());

  // Configuración de OpenAPI
  const document = SwaggerModule.createDocument(app, SWAGGER_CONFIG);

  // Servir el spec OpenAPI en /api-json sin UI
  app.use('/api-json', (_req: Request, res: Response) => res.json(document));

  app.use('/docs', apiReference(SCALAR_CONFIG));

  await app.listen(ENVS.port);
  logger.log(`API disponible en: http://localhost:${ENVS.port}/api`);
  logger.log(`Documentación disponible en: http://localhost:${ENVS.port}/docs`);
}
bootstrap();
