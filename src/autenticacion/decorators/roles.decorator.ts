import { SetMetadata } from '@nestjs/common';
import type { RolesPermitidos } from '../types/roles-permitidos.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolesPermitidos[]) => SetMetadata(ROLES_KEY, roles);
