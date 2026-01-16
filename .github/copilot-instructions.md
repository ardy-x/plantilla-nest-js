# Plantilla NestJS - Instrucciones para IA

## Visión General de la Arquitectura

Esta es una plantilla **NestJS + Prisma + PostgreSQL** con **autenticación Kerberos JWT**. Se utilizan convenciones de nomenclatura en español (carpetas: `controladores`, `servicios`, DTOs, errores).

### Patrones Estructurales Clave

- **Organización modular**: Módulos de funcionalidades en español (`autenticacion/`, los módulos futuros siguen este patrón)
- **Arquitectura por capas**: `controladores/` → `servicios/` → `repositorios/` → `prisma/` (usar patrón repository para consultas de BD)
- **APIs externas**: Módulos que consumen servicios externos usan carpeta `apis/` en lugar de `repositorios/` (ej: autenticación usa `KerberosApi` para comunicarse con servicio Kerberos externo)
- **Core compartido**: `/src/core/` contiene DTOs, filtros, builders utilizados en todos los módulos
- **Configuración centralizada**: `/src/config/` exporta constantes tipadas (ENVS, CORS_CONFIG, etc.) - nunca importar de `@nestjs/config` directamente en la lógica de negocio

## Convención de Formato de Respuestas

**CRÍTICO**: Todas las respuestas de la API DEBEN usar `RespuestaBuilder` con datos envueltos en objetos nombrados.

### Responsabilidad de Capas

- **Controladores**: Construyen la respuesta completa usando `RespuestaBuilder`
- **Servicios**: Retornan SOLO los datos (objeto plano con wrapper nombrado)
- **Repositorios**: Consultas a la base de datos (Prisma)
- **APIs**: Clientes HTTP para servicios externos

```typescript
// ✅ CORRECTO
// Servicio:
async buscarUsuarioPorId(id: string) {
  const usuario = await this.usuariosRepository.buscarUsuarioPorId(id);
  return { usuario }; // Datos envueltos
}

// Controlador:
@Get(':id')
async obtener(@Param('id', ParseUUIDPipe) id: string) {
  const datos = await this.usuariosService.buscarUsuarioPorId(id);
  return RespuestaBuilder.exito(200, 'Usuario encontrado exitosamente', datos);
}

// ❌ INCORRECTO
async buscarUsuarioPorId(id: string) {
  return RespuestaBuilder.exito(...); // Servicio NO debe construir respuesta
}
```

**Estructura de Respuesta:**
```typescript
{
  error: boolean,
  status: number,
  message: string,  // Mensaje amigable en español
  response: { entidadNombrada: datos } | null
}
```

**Paginación:** Incluir `usuarios` + `paginacion` en el objeto de datos.

## Autenticación y Autorización

**Guards:** Orden `KerberosJwtGuard` → `RolesGuard`
```typescript
@UseGuards(KerberosJwtGuard, RolesGuard)
@Roles('ADMIN', 'SUPERADMIN')
async metodo(@IdUsuarioActual() userId: string) {}
```

**Rutas públicas:** Usar `@Public()` para omitir autenticación

## Validación y Manejo de Errores

- **Validación**: Class-validator con `VALIDATION_PIPE_CONFIG`
- **Traducción**: Errores se traducen automáticamente al español en `ExcepcionGlobalFilter`
- **DTOs**: Extender `PaginacionQueryDto` para endpoints de listado
- **UUIDs**: Usar `ParseUUIDPipe` en `@Param()` para IDs

## Convenciones de Nomenclatura

**IMPORTANTE**: Carpetas en español, sufijos de archivos en inglés:

```
src/
  <funcionalidad>/
    <funcionalidad>.module.ts
    controladores/
      usuarios.controller.ts      # ✅ Carpeta español, sufijo inglés
    servicios/
      usuarios.service.ts         # ✅ Carpeta español, sufijo inglés
    repositorios/
      usuarios.repository.ts      # ✅ Carpeta español, sufijo inglés - Para consultas de BD
    apis/
      kerberos.api.ts             # ✅ Carpeta español, sufijo inglés - Para servicios externos
    guardias/
      permisos.guard.ts           # ✅ Carpeta español, sufijo inglés
    decoradores/
      usuario-actual.decorator.ts # ✅ Carpeta español, sufijo inglés
    estrategias/
      jwt.strategy.ts             # ✅ Carpeta español, sufijo inglés
    tipos/
      roles.enum.ts               # ✅ Carpeta español, sufijo inglés
    dtos/
      entrada/
      salida/
```

## Herramientas de Calidad de Código

- **Lint/Format**: `pnpm lint` (Biome, NO ESLint/Prettier)
- **Commits**: Formato `tipo(scope): mensaje` - scope **obligatorio**
  - Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

## Configuración

- **Env**: Todas las variables en [src/config/envs.config.ts](../src/config/envs.config.ts) con validación Zod
- **Importar**: `import { ENVS } from '@/config/envs.config'` NO `process.env`
- **Alias**: Usar `@/` para imports absolutos

## NO Hacer

- ❌ Llamar a Prisma directamente desde servicios (usar repositorios)
- ❌ Usar repositorios para servicios externos (usar carpeta `apis/`)
- ❌ Importar `ConfigService` en lógica de negocio (usar `ENVS`)
- ❌ Retornar datos sin envolver en objeto nombrado
- ❌ Construir respuestas en servicios (responsabilidad del controlador)
- ❌ Commits sin scope
- ❌ Validaciones sin traducir en `traducir-validacion.util.ts`
