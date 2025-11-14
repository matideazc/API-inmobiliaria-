# Implementación de AuthContext - Control de Permisos por Rol

## 📋 Resumen

Se implementó un sistema de autenticación global usando React Context API que permite:

- ✅ Autenticación persistente (sobrevive a recargas de página)
- ✅ Control de permisos basado en roles (ADMIN, REVISOR, ASESOR)
- ✅ Botón "Cambiar estado" solo visible para ADMIN y REVISOR
- ✅ Logout automático en errores 401
- ✅ Información del usuario visible en la interfaz

## 🗂️ Archivos creados

### 1. `src/context/AuthContext.tsx` (NUEVO)

**Propósito**: Contexto global de autenticación

**Exports**:

- `AuthUser` (interface): Tipo de usuario con id, nombre, email, rol
- `AuthProvider` (component): Provider del contexto
- `useAuth()` (hook): Hook para acceder al contexto

**Funcionalidades**:

- Lee token y user desde localStorage al montar
- Expone: `{ user, token, setAuth, clearAuth }`
- Configura callback en interceptor de axios para logout automático

**Uso**:

```typescript
const { user, token, setAuth, clearAuth } = useAuth();
```

## 📝 Archivos modificados

### 2. `src/services/api.ts`

**Cambios**:

- ➕ Exporta `setAuthClearCallback()` para configurar logout desde contexto
- ✏️ Interceptor 401 ahora llama a `clearAuthCallback()` en lugar de solo limpiar localStorage
- ✏️ Fallback a limpieza de localStorage si callback no está disponible

**Ventaja**: El logout ahora limpia tanto el contexto como localStorage

### 3. `src/main.tsx`

**Cambios**:

- ➕ Importa `AuthProvider`
- ✏️ Envuelve `<App />` con `<AuthProvider>`

**Resultado**:

```tsx
<StrictMode>
  <AuthProvider>
    <App />
  </AuthProvider>
</StrictMode>
```

### 4. `src/routes/ProtectedRoute.tsx`

**Cambios**:

- ➕ Importa `useAuth()`
- ✏️ Lee `user` y `token` del contexto (antes solo leía localStorage)
- ✏️ Valida que AMBOS existan antes de permitir acceso

**Antes**:

```typescript
const token = localStorage.getItem('token');
if (!token) return <Navigate to="/login" />;
```

**Ahora**:

```typescript
const { user, token } = useAuth();
if (!token || !user) return <Navigate to="/login" />;
```

### 5. `src/pages/Login.tsx`

**Cambios**:

- ➕ Importa `useAuth()` y `AuthUser`
- ➕ Función `decodeJWT()` para extraer datos del token (sin librerías externas)
- ✏️ En el submit: guarda token + user usando `setAuth()`
- ✏️ Si backend envía `user` completo, lo usa directamente
- ✏️ Si no, decodifica el JWT para construir el objeto `user`

**Lógica de login**:

```typescript
const { data } = await api.post('/auth/login', { email, password });

let user: AuthUser;
if (data.user) {
  user = data.user; // Backend envía user completo
} else {
  const payload = decodeJWT(data.token); // Decodificar JWT
  user = {
    id: payload.id,
    nombre: payload.nombre || payload.email.split('@')[0],
    email: payload.email,
    rol: payload.rol,
  };
}

setAuth(data.token, user); // Guarda en contexto + localStorage
```

**Respuestas soportadas**:

1. Backend con user completo:

```json
{
  "token": "jwt...",
  "user": {
    "id": 1,
    "nombre": "Matias",
    "email": "matias@example.com",
    "rol": "ADMIN"
  }
}
```

2. Backend solo con token:

```json
{
  "token": "jwt_con_payload_que_incluye_id_email_rol_nombre"
}
```

### 6. `src/pages/ExpedienteDetail.tsx`

**Cambios**:

- ➕ Importa `useAuth()` en lugar de `canChangeStatus` de auth.ts
- ➕ Lee `user` del contexto
- ✏️ Calcula `canChangeStatus` localmente: `user?.rol === 'ADMIN' || user?.rol === 'REVISOR'`
- ✏️ Botón "Cambiar estado" solo se renderiza si `canChangeStatus` es true

**Antes**:

```typescript
import { canChangeStatus } from '../services/auth';
const userCanChangeStatus = canChangeStatus();
```

**Ahora**:

```typescript
import { useAuth } from '../context/AuthContext';
const { user } = useAuth();
const canChangeStatus = user?.rol === 'ADMIN' || user?.rol === 'REVISOR';

// En el JSX
{canChangeStatus && (
  <button onClick={() => setShowModal(true)}>
    🔄 Cambiar estado
  </button>
)}
```

### 7. `src/pages/ExpedientesList.tsx`

**Cambios**:

- ➕ Importa `useAuth()`
- ➕ Lee `user` y `clearAuth` del contexto
- ✏️ Muestra nombre y rol del usuario en el header
- ✏️ `handleLogout()` ahora llama a `clearAuth()` del contexto

**Resultado visual**:
```
Expedientes
👤 Matias (ADMIN)        [Cerrar sesión]
```

## 🎯 Control de permisos implementado

### Roles y sus permisos

| Funcionalidad | ADMIN | REVISOR | ASESOR |
|--------------|-------|---------|--------|
| Ver lista de expedientes | ✅ | ✅ | ✅ |
| Ver detalle de expediente | ✅ | ✅ | ✅ |
| Ver documentos | ✅ | ✅ | ✅ |
| Subir documentos | ✅ | ✅ | ✅ |
| **Cambiar estado** | ✅ | ✅ | ❌ |
| Ver botón "Cambiar estado" | ✅ | ✅ | ❌ |

### ¿Dónde se valida?

1. **Frontend (UI)**:
   - `ExpedienteDetail.tsx`: Oculta botón "Cambiar estado" si `user?.rol === 'ASESOR'`

2. **Backend (API)**:
   - El endpoint `PUT /expedientes/:id/estado` debe validar el rol en el middleware
   - Si un ASESOR intenta hacer PUT (ej: con Postman), el backend debe rechazarlo

## 🔄 Flujo de autenticación

### Login exitoso:

```
1. Usuario ingresa email + password
2. POST /auth/login
3. Backend responde con token (+ user opcional)
4. Frontend decodifica token o usa user del response
5. setAuth(token, user) → Guarda en contexto + localStorage
6. navigate('/expedientes')
```

### Recarga de página:

```
1. useEffect en AuthProvider lee localStorage
2. Si hay token + user → setUser(parsedUser) y setToken(token)
3. ProtectedRoute verifica que user y token existan
4. Si existen → Renderiza página
5. Si no → Redirige a /login
```

### Logout manual:

```
1. Usuario hace clic en "Cerrar sesión"
2. clearAuth() → Limpia estado + localStorage
3. navigate('/login')
```

### Logout automático (401):

```
1. API responde con status 401
2. Interceptor de axios detecta el error
3. clearAuthCallback() → Limpia contexto + localStorage
4. window.location.href = '/login'
```

## ✅ Objetivo cumplido

Después de esta implementación:

- ✅ **Usuario ASESOR**: Ve expedientes y documentos, pero NO ve el botón "Cambiar estado"
- ✅ **Usuario ADMIN/REVISOR**: Ve todo, incluyendo el botón "Cambiar estado"
- ✅ **Persistencia**: Si recargo la página, sigo logueado
- ✅ **Logout automático**: Si el token expira (401), vuelvo al login
- ✅ **TypeScript**: Todo tipado correctamente
- ✅ **Dark mode**: No se rompió el tema oscuro

## 🧪 Cómo probar

### Caso 1: Login con usuario ADMIN

```
1. Iniciar sesión con email de ADMIN
2. Ir a /expedientes
3. Ver nombre y rol en header: "👤 Nombre (ADMIN)"
4. Click en un expediente
5. ✅ DEBE aparecer botón "🔄 Cambiar estado"
6. Click en "Cambiar estado"
7. ✅ DEBE abrir el modal
```

### Caso 2: Login con usuario ASESOR

```
1. Iniciar sesión con email de ASESOR
2. Ir a /expedientes
3. Ver nombre y rol en header: "👤 Nombre (ASESOR)"
4. Click en un expediente
5. ❌ NO DEBE aparecer botón "🔄 Cambiar estado"
6. Ver estado y observaciones (solo lectura)
```

### Caso 3: Persistencia

```
1. Login exitoso
2. Ir a /expedientes
3. Recargar página (F5)
4. ✅ DEBE seguir en /expedientes (no volver a /login)
5. ✅ DEBE mostrar nombre y rol en header
```

### Caso 4: Logout

```
1. Login exitoso
2. Click en "Cerrar sesión"
3. ✅ DEBE redirigir a /login
4. ✅ localStorage.getItem('token') debe ser null
5. ✅ localStorage.getItem('user') debe ser null
```

## 📦 Sin dependencias nuevas

- ✅ No se instaló `jwt-decode`
- ✅ No se instaló `react-query`
- ✅ No se instaló `zustand` ni `redux`
- ✅ Solo se usó React Context API nativo
- ✅ Decodificación JWT manual con `atob()` nativo

## 🚀 Próximos pasos sugeridos

1. Agregar mensaje de bienvenida al login
2. Implementar "Recordarme" (refresh token)
3. Agregar timeout de sesión (auto-logout después de X minutos)
4. Mostrar badge de rol con colores diferentes (ADMIN verde, REVISOR azul, ASESOR gris)
5. Agregar página de perfil de usuario
6. Implementar cambio de contraseña
