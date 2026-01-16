import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ENVS } from './envs.config';

export const CORS_CONFIG: CorsOptions = {
  origin: ENVS.environment === 'development' ? '*' : ENVS.frontendUrl,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
};
