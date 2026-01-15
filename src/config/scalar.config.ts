import type { NestJSReferenceConfiguration } from '@scalar/nestjs-api-reference';

export const scalarConfig: NestJSReferenceConfiguration = {
  theme: 'moon',
  url: '/api-json',
  hideModels: true,
  hideClientButton: true,
};
