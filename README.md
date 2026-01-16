# API Personal Policial - Plantilla Base NestJS

[![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Biome](https://img.shields.io/badge/Biome-Latest-60A5FA?logo=biome)](https://biomejs.dev)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io)

Plantilla base para proyectos NestJS con Biome, Husky y estructura estandarizada.

## Inicio Rápido

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env

# Crear carpeta keys y agregar public.pem
mkdir keys
# Coloca tu archivo public.pem en keys/

# Iniciar en desarrollo (Prisma ya configurado)
pnpm start:dev
```


## Estructura de Respuestas

Todas las respuestas siguen el formato estándar usando `RespuestaBaseDto`:

```typescript
{
  "error": false,
  "status": 200,
  "message": "Mensaje descriptivo",
  "response": {
    "entidad": { /* datos específicos */ }
  }
}
```

Los datos siempre se envuelven en un objeto nombrado para mayor claridad (ej: `usuario`, `usuarios`, `producto`, etc.).

### ❌ Incorrecto (No hacer)

```typescript
// ❌ MAL: Datos directos en response
return RespuestaBuilder.exito(200, 'Usuario encontrado', {
  id: 1,
  nombre: "Juan Pérez",
  email: "juan@example.com"
});
```

Esto produce una respuesta confusa:

```typescript
{
  "error": false,
  "status": 200,
  "message": "Usuario encontrado",
  "response": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```

### ✅ Correcto

```typescript
// ✅ BIEN: Datos envueltos en objeto nombrado
return RespuestaBuilder.exito(200, 'Usuario encontrado exitosamente', { 
  usuario: {
    id: 1,
    nombre: "Juan Pérez",
    email: "juan@example.com"
  }
});
```

Esto produce una respuesta clara:

```typescript
{
  "error": false,
  "status": 200,
  "message": "Usuario encontrado exitosamente",
  "response": {
    "usuario": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "juan@example.com"
    }
  }
}
```

### Respuestas de Error

El filtro global `ExcepcionGlobalFilter` captura todas las excepciones y las formatea:

```typescript
{
  "error": true,
  "status": 400,
  "message": "Validación falló (se esperaba un UUID válido)",
  "response": null
}
```

Los mensajes se traducen automáticamente al español usando `traducir-validacion.util.ts`.

## Paginación

### Query DTO Base

Usa `PaginacionQueryDto` para endpoints con paginación:

```typescript
import { PaginacionQueryDto } from '@/core/dto/paginacion-query.dto';

@Controller('usuarios')
export class UsuariosController {
  @Get()
  async listar(@Query() query: PaginacionQueryDto) {
    // query.pagina, query.elementosPorPagina, query.busqueda, query.ordenarPor, query.orden
  }
}
```

### Extender Query DTO

Agrega filtros personalizados extendiendo el DTO base:

```typescript
import { PaginacionQueryDto } from '@/core/dto/paginacion-query.dto';
import { IsOptional, IsEnum } from 'class-validator';

export class UsuariosQueryDto extends PaginacionQueryDto {
  @IsOptional()
  @IsEnum(['activo', 'inactivo'])
  estado?: string;

  @IsOptional()
  rol?: string;
}
```

Luego úsalo en tu controlador:

```typescript
@Get()
async listar(@Query() query: UsuariosQueryDto) {
  // Ahora tienes: pagina, elementosPorPagina, busqueda, ordenarPor, orden, estado, rol
}
```

### Respuesta de Paginación

```typescript
import { PaginacionRespuestaBaseDto } from '@/core/dto/respuesta-base.dto';

interface PaginacionMeta {
  total: number;
  pagina: number;
  elementosPorPagina: number;
  totalPaginas: number;
}

const respuesta = {
  usuarios,
  paginacion: {
    total: 100,
    pagina: 1,
    elementosPorPagina: 10,
    totalPaginas: 10
  }
};

return RespuestaBuilder.exito(200, 'Usuarios obtenidos', { usuarios: respuesta.usuarios, paginacion: respuesta.paginacion });
```

## Protección de Rutas

### Guards Disponibles

#### 1. KerberosJwtGuard (Autenticación)

Protege rutas que requieren autenticación JWT:

```typescript
import { KerberosJwtGuard } from '@/autenticacion/guards/kerberos-jwt.guard';

@Controller('usuarios')
@UseGuards(KerberosJwtGuard) // Protege todo el controlador
export class UsuariosController {
  
  @Get()
  async listar() {
    // Solo usuarios autenticados pueden acceder
  }
}
```

#### 2. RolesGuard (Autorización)

Protege rutas que requieren roles específicos:

```typescript
import { KerberosJwtGuard } from '@/autenticacion/guards/kerberos-jwt.guard';
import { RolesGuard } from '@/autenticacion/guards/roles.guard';

@Controller('admin')
@UseGuards(KerberosJwtGuard, RolesGuard) // Ambos guards
export class AdminController {
  
  @Get('usuarios')
  @Roles('ADMIN', 'SUPERADMIN') // Solo estos roles
  async listarUsuarios() {
    // Solo admins y superadmins
  }
}
```

### Decoradores Disponibles

#### @Public()

Marca rutas como públicas (sin autenticación):

```typescript
import { Public } from '@/autenticacion/decorators/public.decorator';

@Controller('auth')
@UseGuards(KerberosJwtGuard) // Guard global
export class AuthController {
  
  @Post('login')
  @Public() // Esta ruta es pública
  async login() {
    // No requiere autenticación
  }
  
  @Get('perfil')
  async perfil() {
    // Requiere autenticación (guard del controlador)
  }
}
```

#### @Roles()

Define roles permitidos para una ruta:

```typescript
import { Roles } from '@/autenticacion/decorators/roles.decorator';

@Controller('reportes')
@UseGuards(KerberosJwtGuard, RolesGuard)
export class ReportesController {
  
  @Get()
  @Roles('ADMIN', 'SUPERVISOR')
  async obtenerReportes() {
    // Solo admins y supervisores
  }
}
```

#### @IdUsuarioActual()

Obtiene el ID del usuario autenticado:

```typescript
import { IdUsuarioActual } from '@/autenticacion/decorators/id-usuario.decorator';

@Controller('perfil')
@UseGuards(KerberosJwtGuard)
export class PerfilController {
  
  @Get()
  async miPerfil(@IdUsuarioActual() idUsuario: string) {
    // idUsuario contiene el ID del usuario autenticado
    return this.usuariosService.buscarPorId(idUsuario);
  }
}
```

### Ejemplo Completo

```typescript
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { KerberosJwtGuard } from '@/autenticacion/guards/kerberos-jwt.guard';
import { RolesGuard } from '@/autenticacion/guards/roles.guard';
import { Public } from '@/autenticacion/decorators/public.decorator';
import { Roles } from '@/autenticacion/decorators/roles.decorator';
import { IdUsuarioActual } from '@/autenticacion/decorators/id-usuario.decorator';

@Controller('productos')
@UseGuards(KerberosJwtGuard, RolesGuard)
export class ProductosController {
  
  @Get('publicos')
  @Public() // Cualquiera puede ver
  async productosPublicos() {
    return this.productosService.obtenerPublicos();
  }
  
  @Get('mis-productos')
  async misProductos(@IdUsuarioActual() idUsuario: string) {
    // Usuario autenticado
    return this.productosService.obtenerPorUsuario(idUsuario);
  }
  
  @Post()
  @Roles('VENDEDOR', 'ADMIN')
  async crear(@Body() dto: CrearProductoDto) {
    // Solo vendedores y admins
    return this.productosService.crear(dto);
  }
  
  @Delete(':id')
  @Roles('ADMIN')
  async eliminar(@Param('id') id: string) {
    // Solo admins
    return this.productosService.eliminar(id);
  }
}
```

## Documentación API

La documentación está configurada con **Swagger** y **Scalar UI**:

- **Scalar UI**: http://localhost:4000/docs (interfaz moderna)
- **JSON Spec**: http://localhost:4000/api-json

Todos los endpoints, DTOs y decoradores se documentan automáticamente.

## Biome (Linter y Formatter)

```bash
pnpm format      # Formatear código
pnpm lint        # Lint + autofix
pnpm lint:check  # Solo verificar
```

**Auto-formato**: Al guardar (Ctrl+S) en VS Code.

## Husky - Git Hooks

### Formato de Commits (Obligatorio)

```
tipo(scope): descripción
```

**Tipos**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

**Ejemplos:**
```bash
feat(usuarios): agregar endpoint de listado
fix(auth): corregir validación de token
docs(readme): actualizar instrucciones
refactor(core): reorganizar DTOs
```

**Nota:** El scope es **obligatorio** y debe estar en **minúsculas**.

## Módulo Core

```
src/core/
├── dto/
│   ├── paginacion-query.dto.ts      # DTO base para queries con paginación
│   ├── paginacion-response.dto.ts   # Tipos para respuestas paginadas
│   └── respuesta-base.dto.ts        # Formato estándar de respuestas
├── filtros/
│   └── excepcion-global.filter.ts   # Manejo global de excepciones
├── interfaces/
│   ├── paginacion-query.interface.ts
│   └── paginacion-response.interface.ts
└── utilidades/
    └── respuesta.builder.ts         # Builder para respuestas estándar
```

### RespuestaBuilder

Métodos disponibles:

```typescript
// Éxito
RespuestaBuilder.exito<T>(codigo: number, mensaje: string, datos?: T)

// Error
RespuestaBuilder.error(codigo: number, mensaje: string)
```

## Configuración Inicial

### 1. Variables de Entorno (.env)

```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://usuario:pass@localhost:5432/db"
FRONTEND_URL=http://localhost:3000  # URL del frontend para CORS
KERBEROS_API_BASE=https://api.ejemplo.com
REDIS_URL=redis://localhost:6379
REDIS_TTL=300
API_TITLE="Mi API"
API_DESCRIPTION="Descripción"
API_VERSION="1.0.0"
```

### 2. Clave Pública JWT

**Importante:** Crea la carpeta `keys/` y agrega `public.pem`:

```bash
mkdir keys
# Agregar keys/public.pem (no commitear)
```

## Scripts

```bash
pnpm start:dev    # Desarrollo
pnpm build        # Compilar
pnpm start:prod   # Producción
pnpm format       # Formatear
pnpm format:check # Verificar formato
pnpm lint         # Lint
pnpm lint:check   # Solo verificar lint
```

## Stack Tecnológico

- **NestJS 11** - Framework
- **PostgreSQL + Prisma** - Base de datos
- **Biome** - Linter/Formatter
- **Husky** - Git hooks
- **Swagger + Scalar** - Documentación
- **JWT + Passport** - Autenticación

## Recursos

- [NestJS Docs](https://docs.nestjs.com)
- [Biome Docs](https://biomejs.dev)
- [Conventional Commits](https://www.conventionalcommits.org)

---

**Plantilla creada para proyectos consistentes y escalables.**
