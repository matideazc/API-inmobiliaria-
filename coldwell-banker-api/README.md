# API Coldwell Banker - Gestión de Expedientes Inmobiliarios

API REST desarrollada con Node.js + TypeScript para la gestión de expedientes inmobiliarios.

## 🚀 Tecnologías

- **Node.js** + **TypeScript**
- **Express** - Framework web
- **Prisma** - ORM
- **SQLite** - Base de datos (desarrollo)
- **JWT** - Autenticación con roles
- **bcrypt** - Hash de contraseñas

## 📦 Instalación

```bash
npm install
```

## 🔧 Scripts disponibles

```bash
# Modo desarrollo (con hot-reload)
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar producción
npm start
```

## 🌐 Endpoints actuales

- `GET /` - Info de la API
- `GET /health` - Health check del servidor

## 📝 Estado del proyecto

✅ **Paso 1: Inicialización del proyecto**

- ✅ Configuración de TypeScript
- ✅ Instalación de dependencias de producción
- ✅ Instalación de dependencias de desarrollo
- ✅ Estructura de carpetas

✅ **Paso 2: Configuración de Prisma**

- ✅ `npx prisma init` - Inicialización de Prisma
- ✅ Configuración de `tsconfig.json` con opciones estrictas
- ✅ Modo `strict` activado para máxima seguridad de tipos
- ✅ Servidor Express básico funcionando
- ✅ Creación del archivo `.env` con variables de entorno
- ✅ Configuración de SQLite como base de datos (`DATABASE_URL="file:./dev.db"`)
- ✅ Definición del schema de Prisma con los modelos:
  - **Usuario** (id, nombre, email, hash, rol, createdAt)
  - **Expediente** (id, propietarioNombre, asesorId, estado, comentariosRevisor, createdAt, updatedAt)
  - **Documento** (id, expedienteId, tipo, rutaArchivo, createdAt)
  - **Mandato** (id, expedienteId, plazoMes, monto, createdAt)
  - **InformeIA** (id, expedienteId, texto, createdAt)
- ✅ Enums definidos: `Rol`, `Estado`, `DocTipo`
- ✅ `npx prisma generate` - Cliente de Prisma generado
- ✅ `npx prisma migrate dev --name init` - Primera migración creada y aplicada
- ✅ Base de datos SQLite `dev.db` creada con todas las tablas
- ✅ Archivo `src/prisma.ts` con instancia única de PrismaClient

⏳ **Próximos pasos:**

- Configuración del servidor Express en `src/app.ts`
- Sistema de autenticación con JWT
- Rutas de autenticación (login, registro)
- Rutas de expedientes
- Rutas de documentos
- Middleware de autenticación
- Validación de datos

---
Desarrollado paso a paso 🎯
