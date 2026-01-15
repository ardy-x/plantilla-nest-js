import { DocumentBuilder } from '@nestjs/swagger';
import { envs } from './envs.config';

export const swaggerConfig = new DocumentBuilder()
  .setTitle(envs.apiTitle)
  .setDescription(envs.apiDescription)
  .setVersion(envs.apiVersion)
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
