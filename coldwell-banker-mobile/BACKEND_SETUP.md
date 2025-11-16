# Configuración del Backend

Este archivo contiene instrucciones para configurar la conexión con el backend.

## URL del Backend

Editar `src/api/client.ts` y cambiar la constante `API_BASE_URL`:

```typescript
const API_BASE_URL = 'https://tu-backend.com/api';
```

### Configuraciones comunes:

**Desarrollo local (desde emulador Android):**
```typescript
const API_BASE_URL = 'http://10.0.2.2:3000/api';
```

**Desarrollo local (desde dispositivo físico en misma red WiFi):**
```typescript
const API_BASE_URL = 'http://192.168.X.X:3000/api'; // Cambiar por tu IP local
```

**Producción:**
```typescript
const API_BASE_URL = 'https://api.coldwellbanker.com/api';
```

## Endpoints a verificar

Una vez configurada la URL base, verifica que estos endpoints existan en tu backend:

### Autenticación (`src/api/authApi.ts`)
- `POST /auth/login` - Login de usuario

### Propiedades (`src/api/propertiesApi.ts`)
- `GET /propiedades/mis-propiedades` - Propiedades del asesor
- `GET /propiedades` - Todas las propiedades (admin)
- `GET /propiedades/:id` - Detalle de propiedad
- `POST /propiedades` - Crear propiedad
- `PUT /propiedades/:id` - Actualizar propiedad
- `PATCH /propiedades/:id/estado` - Cambiar estado (admin)
- `POST /propiedades/:id/documentos` - Subir documento
- `DELETE /propiedades/:id` - Eliminar propiedad

### Mandatos (`src/api/mandatesApi.ts`)
- `GET /mandatos/propiedad/:propiedadId` - Obtener mandato
- `POST /mandatos` - Crear mandato
- `PUT /mandatos/:id` - Actualizar mandato
- `GET /mandatos/:id/pdf` - Obtener PDF del mandato

## Ajustar rutas según tu backend

Si tus rutas son diferentes, edita los archivos correspondientes:

**Ejemplo:** Si tu endpoint de login es `/api/auth/signin` en lugar de `/api/auth/login`:

```typescript
// src/api/authApi.ts
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/signin', { // ⬅️ Cambiar aquí
      email,
      password,
    });
    return response.data;
  },
};
```

## Estructura de respuestas esperadas

El cliente espera estas estructuras de datos. Ajustar si tu backend usa nombres diferentes:

### Login Response
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "123",
    "email": "usuario@email.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rol": "ASESOR" // o "ADMIN"
  }
}
```

### Property
```json
{
  "id": "1",
  "nombre": "Depto 2 ambientes",
  "direccion": "Av. Santa Fe 1234",
  "api": "API123",
  "propietario": "Juan Pérez",
  "emailContacto": "contacto@email.com",
  "asesorId": "123",
  "asesorNombre": "María García",
  "estado": "PENDIENTE", // "APROBADO" o "RECHAZADO"
  "observaciones": "...",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### Mandate
```json
{
  "id": "1",
  "propiedadId": "1",
  "monto": 150000,
  "moneda": "ARS",
  "plazo": "6 meses",
  "observaciones": "...",
  "urlPdf": "https://...",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

Si los nombres de campos son diferentes, ajustar las interfaces en `src/types/index.ts`.

