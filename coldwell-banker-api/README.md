# 🏢 Coldwell Banker API - Backend

Sistema backend para gestión inmobiliaria con Node.js, Express y TypeScript.

## 🚀 Tecnologías

- **Node.js** v18+
- **Express** v4.18
- **TypeScript** v5.9
- **Prisma ORM** v5.22
- **PostgreSQL** v14+
- **JWT** para autenticación
- **Bcrypt** para hash de contraseñas
- **Multer** para subida de archivos
- **Docxtemplater** para generación de documentos Word

## 📦 Funcionalidades

### 🔐 Autenticación y Autorización
- Login con JWT
- Sistema de 3 roles: ADMIN, REVISOR, ASESOR
- Middleware de autenticación
- Validación de permisos por endpoint

### 👥 Gestión de Usuarios
- CRUD completo de usuarios
- Listado con paginación y filtros
- Validación de emails únicos
- Hash de contraseñas con bcrypt
- Soft delete

### 🏠 Gestión de Expedientes/Propiedades
- CRUD completo
- Filtros avanzados (estado, asesor, fechas)
- Cambio de estado (PENDIENTE → APROBADO/RECHAZADO)
- Observaciones del revisor
- ASESOR solo ve sus propios expedientes
- ADMIN/REVISOR ven todos

### 📄 Gestión de Documentos
- Subida de archivos PDF (hasta 10MB)
- Almacenamiento organizado por expediente
- Tipos: ESCRITURA, DNI, API, TGI, PLANOS, MENSURA, TASA, OTRO, PDF_COMPLETO
- Descarga segura con validación de permisos
- Prevención de path traversal

### 📝 Gestión de Mandatos
- Creación de mandatos para expedientes APROBADOS
- Generación automática de documentos Word (.docx)
- Plantilla personalizable
- Descarga segura

## 🔒 Seguridad Implementada

- ✅ CORS configurado con origen específico
- ✅ Validación de inputs
- ✅ Prevención de path traversal
- ✅ Prevención de SQL injection (Prisma ORM)
- ✅ Manejo global de errores
- ✅ Hash de contraseñas
- ✅ JWT para autenticación
- ✅ Autorización basada en roles

## 📁 Estructura del Proyecto

```
src/
├── config/
│   └── multer.config.ts       # Configuración de subida de archivos
├── controllers/
│   ├── auth.controller.ts     # Login y autenticación
│   ├── usuarios.controller.ts # CRUD de usuarios
│   ├── expedientes.controller.ts # CRUD de expedientes
│   ├── documentos.controller.ts  # Subida de documentos
│   ├── download.controller.ts    # Descarga segura
│   └── mandatos.controller.ts    # Generación de mandatos
├── middlewares/
│   ├── auth.middleware.ts        # Verificación de JWT
│   └── error-handler.middleware.ts # Manejo de errores
├── routes/
│   ├── auth.routes.ts
│   ├── usuarios.routes.ts
│   ├── expedientes.routes.ts
│   ├── documentos.routes.ts
│   └── mandatos.routes.ts
├── services/
│   └── mandato.service.ts     # Lógica de generación de mandatos
├── prisma.ts                  # Cliente de Prisma
├── app.ts                     # Configuración de Express
└── server.ts                  # Inicio del servidor
```

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar migraciones de base de datos
npx prisma migrate dev

# Iniciar servidor en desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar en producción
npm start
```

## 🌐 Variables de Entorno

```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/coldwell_banker"

# JWT
JWT_SECRET="tu_secreto_super_seguro_aqui"

# Servidor
PORT=3000
NODE_ENV=development

# Frontend (para CORS)
FRONTEND_URL="http://localhost:5173"

# Logs
LOG_LEVEL=info
```

## 📡 Endpoints Principales

### Autenticación
- `POST /auth/login` - Login
- `POST /auth/register` - Registro (solo ADMIN)

### Usuarios
- `GET /usuarios` - Listar usuarios
- `GET /usuarios/:id` - Ver usuario
- `POST /usuarios` - Crear usuario (ADMIN)
- `PUT /usuarios/:id` - Editar usuario (ADMIN)
- `DELETE /usuarios/:id` - Eliminar usuario (ADMIN)

### Expedientes
- `GET /expedientes` - Listar expedientes (con filtros)
- `GET /expedientes/:id` - Ver expediente
- `POST /expedientes` - Crear expediente
- `PUT /expedientes/:id` - Editar expediente
- `PUT /expedientes/:id/estado` - Cambiar estado (ADMIN/REVISOR)

### Documentos
- `GET /documentos/:expedienteId` - Listar documentos
- `POST /documentos` - Subir documento PDF
- `GET /documentos/:id/download` - Descargar documento (seguro)
- `DELETE /documentos/:id` - Eliminar documento

### Mandatos
- `POST /expedientes/:id/mandato` - Crear mandato
- `GET /mandatos/:id/download` - Descargar mandato Word

## 🔑 Roles y Permisos

### ADMIN
- Acceso total al sistema
- Crear/editar/eliminar usuarios
- Ver todos los expedientes
- Aprobar/rechazar expedientes
- Ver todos los mandatos

### REVISOR
- Ver todos los expedientes
- Aprobar/rechazar expedientes
- No puede crear usuarios

### ASESOR
- Ver solo sus propios expedientes
- Crear expedientes
- Subir documentos
- Crear mandatos (solo para expedientes APROBADOS)

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test

# Coverage
npm run test:coverage
```

## 📝 Notas de Desarrollo

### Correcciones de Seguridad Aplicadas
- **Path Traversal Prevention**: Validación de rutas en subida de archivos
- **Authorization Bypass Fix**: ASESOR solo puede filtrar por su propio ID
- **CORS Configuration**: Origen específico configurado
- **Global Error Handling**: Middleware centralizado
- **Secure File Download**: Endpoint protegido con validación de permisos
- **File Path Normalization**: Rutas relativas en lugar de absolutas

### Próximas Mejoras
- [ ] Tests unitarios y de integración
- [ ] Documentación Swagger/OpenAPI
- [ ] Rate limiting
- [ ] Migración de JWT a cookies httpOnly
- [ ] Integración con OneDrive para almacenamiento
- [ ] Logs estructurados (Winston)
- [ ] Métricas y monitoring

## 👨‍💻 Desarrollador

Matías - Desarrollador Full Stack

## 📄 Licencia

Proyecto privado - Coldwell Banker Argentina
