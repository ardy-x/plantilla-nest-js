import { DocumentBuilder } from '@nestjs/swagger';
import { ENVS } from './envs.config';

export const SWAGGER_CONFIG = new DocumentBuilder()
  .setTitle(ENVS.apiTitle)
  .setDescription(ENVS.apiDescription)
  .setVersion(ENVS.apiVersion)
  .addServer('api') // Agregar el prefijo global a la documentación
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Ingresa tu token JWT',
      in: 'header',
    },
    'JWT-auth',
  )
  .build();
