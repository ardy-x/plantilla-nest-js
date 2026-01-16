import { SetMetadata } from '@nestjs/common';
import type { RolesPermitidos } from '../tipos/roles-permitidos.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolesPermitidos[]) => SetMetadata(ROLES_KEY, roles);
