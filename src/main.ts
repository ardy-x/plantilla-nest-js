import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';
import { envs } from './config/envs.config';
import { scalarConfig } from './config/scalar.config';
import { swaggerConfig } from './config/swagger.config';
import { VALIDATION_PIPE_CONFIG } from './config/validation.config';
import { ExcepcionGlobalFilter } from './core/filtros/excepcion-global.filter';

async function bootstrap() {
  const logger = new Logger(`${envs.apiTitle}`);

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuración de OpenAPI
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Servir el spec OpenAPI en /api-json sin UI
  app.use('/api-json', (_req: Request, res: Response) => res.json(document));

  // Scalar UI en /docs
  app.use('/docs', apiReference(scalarConfig));

  app.useGlobalFilters(new ExcepcionGlobalFilter());

  app.useGlobalPipes(VALIDATION_PIPE_CONFIG);

  app.setGlobalPrefix('api');

  app.enableCors();

  await app.listen(envs.port);
  logger.log(`API disponible en: http://localhost:${envs.port}/api`);
  logger.log(`Documentación disponible en: http://localhost:${envs.port}/docs`);
}
bootstrap();
