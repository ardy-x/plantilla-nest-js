import 'dotenv/config';
import { z } from 'zod';

const envsSchema = z.object({
  PORT: z.coerce.number(),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  DATABASE_URL: z.string(),
  KERBEROS_API_BASE: z.string(),
  REDIS_URL: z.string(),
  REDIS_TTL: z.coerce.number().default(300), // 5 minutos por defecto
  API_TITLE: z.string().default('API'),
  API_DESCRIPTION: z.string().default('API Documentation'),
  API_VERSION: z.string().default('1.0.0'),
  FRONTEND_URL: z.string(),
  SISTEMAS_PERMITIDOS: z.string().transform((val) => val.split(',')),
});

export type ENV_VARS = z.infer<typeof envsSchema>;

const envsVars = envsSchema.parse(process.env);

export const ENVS = {
  port: envsVars.PORT,
  environment: envsVars.NODE_ENV,
  databaseUrl: envsVars.DATABASE_URL,
  kerberosApiBase: envsVars.KERBEROS_API_BASE,
  redisUrl: envsVars.REDIS_URL,
  redisTtl: envsVars.REDIS_TTL,
  apiTitle: envsVars.API_TITLE,
  apiDescription: envsVars.API_DESCRIPTION,
  apiVersion: envsVars.API_VERSION,
  frontendUrl: envsVars.FRONTEND_URL,
  sistemasPermitidos: envsVars.SISTEMAS_PERMITIDOS,
};
