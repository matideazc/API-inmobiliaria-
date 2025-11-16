# Guía de Inicio Rápido - Coldwell Banker Mobile

## 🚀 Configuración en 3 pasos

### Paso 1: Configurar Backend

Edita `src/api/client.ts` línea 11:

```typescript
const API_BASE_URL = 'https://tu-backend.com/api'; // ⬅️ CAMBIAR AQUÍ
```

**Opciones según tu entorno:**

- **Backend en producción:** `https://api.tudominio.com/api`
- **Backend local + emulador Android:** `http://10.0.2.2:3000/api`
- **Backend local + dispositivo físico:** `http://192.168.X.X:3000/api` (tu IP local)

### Paso 2: Verificar configuración

```bash
npm run verify
```

Este comando verifica que todo esté listo.

### Paso 3: Ejecutar la app

```bash
npx expo start
```

Luego elige:
- Presiona `a` para Android
- Presiona `i` para iOS (solo macOS)
- Presiona `w` para Web
- O escanea el QR con Expo Go en tu teléfono

## 📱 Flujo de prueba

### 1. Login

Usa credenciales de un usuario en tu backend:

```
Email: asesor@test.com
Password: tu-password
```

### 2. Como ASESOR

1. **Home** → Presiona "PROPIEDADES"
2. **Listado** → Presiona el botón "+" flotante
3. **Crear Propiedad:**
   - Nombre: "Depto 2 amb - Palermo"
   - Dirección: "Av. Santa Fe 1234"
   - Propietario: "Juan Pérez"
   - Email: "contacto@test.com"
   - Presiona "Crear Propiedad"
4. La propiedad queda en estado **Pendiente**
5. Ve al detalle → No puedes generar mandato aún

### 3. Como ADMIN

1. Inicia sesión con usuario ADMIN
2. Ve al listado de propiedades
3. Abre la propiedad pendiente
4. **Cambiar estado** a "Aprobado"
5. Agrega observaciones (opcional)
6. Presiona "Guardar cambios"

### 4. Generar Mandato (ASESOR)

1. Vuelve a iniciar sesión como ASESOR
2. Abre la propiedad ahora aprobada
3. Presiona "Generar Mandato"
4. Completa:
   - Monto: 150000
   - Plazo: "6 meses"
   - Observaciones: "Comisión 3%"
5. Presiona "Generar Mandato"
6. Luego puedes "Ver/Descargar Mandato"

## 🎯 Casos de uso

### Subir documentos

En el formulario de crear/editar propiedad:
1. Presiona "📎 Adjuntar documentos"
2. Selecciona archivos de tu dispositivo
3. Los archivos se suben al guardar la propiedad

### Editar propiedad

1. Desde el listado, presiona una propiedad
2. En el detalle (futuro: agregar botón editar en header)
3. O modifica `PropertyDetailScreen` para agregar navegación a edit

### Cambiar estados (Admin)

Estados disponibles:
- **Pendiente** (default al crear)
- **Aprobado** (permite generar mandato)
- **Rechazado** (bloqueado para mandato)

## 🛠️ Personalización

### Cambiar colores del tema

`src/theme/colors.ts`:

```typescript
export const colors = {
  primary: '#1E40AF', // ⬅️ Cambia aquí
  background: '#0F172A',
  // ...
};
```

### Agregar campo al formulario

1. **Tipo:** Agrega campo en `src/types/index.ts`
```typescript
export interface Property {
  // ...
  nuevoCampo?: string;
}
```

2. **Formulario:** Agrega input en `PropertyFormScreen.tsx`
```typescript
<InputField
  label="Nuevo Campo"
  value={nuevoCampo}
  onChangeText={setNuevoCampo}
/>
```

3. **API:** Incluye en el DTO
```typescript
const data: CreatePropertyDto = {
  // ...
  nuevoCampo,
};
```

### Modificar rutas de API

Si tu backend usa rutas diferentes, edita los archivos en `src/api/`:

**Ejemplo:** Cambiar `/auth/login` a `/auth/signin`:

`src/api/authApi.ts`:
```typescript
login: async (email: string, password: string) => {
  const response = await apiClient.post('/auth/signin', { // ⬅️ Aquí
    email,
    password,
  });
  return response.data;
},
```

## 🐛 Solución de problemas

### "Network Error" o "timeout"

**Causa:** No puede conectar al backend

**Solución:**
1. Verifica que el backend esté corriendo
2. Verifica la URL en `client.ts`
3. Si usas emulador Android, usa `http://10.0.2.2:PORT/api`
4. Si usas dispositivo físico, usa tu IP local

### "Cannot read property 'nombre' of undefined"

**Causa:** La estructura de respuesta del backend es diferente

**Solución:**
1. Revisa la respuesta en el log
2. Ajusta las interfaces en `src/types/index.ts`
3. O ajusta los nombres de campos en los componentes

### Token expiró

**Comportamiento:** Te redirige al login automáticamente

**Causa:** El interceptor detectó un 401

**Solución:** Normal, vuelve a iniciar sesión

### Expo Go no funciona

**Causa:** Algunas dependencias nativas pueden no funcionar en Expo Go

**Solución:**
```bash
# Crear build de desarrollo
npx expo run:android
# o
npx expo run:ios
```

## 📚 Recursos

- [Documentación React Navigation](https://reactnavigation.org)
- [Documentación Expo](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)

## 🎉 ¡Listo!

Tu app móvil está completamente funcional. Ahora puedes:

1. ✅ Conectar al backend real
2. ✅ Probar el flujo completo
3. ✅ Personalizar según necesidades
4. ✅ Agregar más funcionalidades

**¿Necesitas ayuda?** Revisa `BACKEND_SETUP.md` para detalles de endpoints.
