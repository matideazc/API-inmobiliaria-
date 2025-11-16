# Coldwell Banker Mobile

App móvil del sistema inmobiliario Coldwell Banker, desarrollada con React Native + Expo + TypeScript.

## 📱 Características

- **Autenticación**: Login con email y contraseña
- **Roles**: ASESOR y ADMIN con permisos diferenciados
- **Gestión de Propiedades**: Crear, editar, listar y ver detalles
- **Estados de Propiedad**: Pendiente, Aprobado, Rechazado
- **Mandatos**: Generación de mandatos para propiedades aprobadas
- **Documentación**: Subida de archivos y documentos

## 🏗️ Arquitectura

```
src/
├── api/                 # Cliente HTTP y servicios
│   ├── client.ts       # Configuración de Axios
│   ├── authApi.ts      # Servicio de autenticación
│   ├── propertiesApi.ts # Servicio de propiedades
│   └── mandatesApi.ts  # Servicio de mandatos
├── components/          # Componentes reutilizables
│   ├── PrimaryButton.tsx
│   ├── StatusBadge.tsx
│   ├── PropertyCard.tsx
│   └── InputField.tsx
├── contexts/           # Context API
│   └── AuthContext.tsx # Manejo de sesión
├── navigation/         # Navegación
│   ├── AuthStack.tsx   # Stack sin sesión
│   ├── AppStack.tsx    # Stack con sesión
│   └── RootNavigator.tsx
├── screens/            # Pantallas
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   ├── PropertiesListScreen.tsx
│   ├── PropertyDetailScreen.tsx
│   ├── PropertyFormScreen.tsx
│   └── MandateFormScreen.tsx
├── theme/              # Tema visual
│   ├── colors.ts
│   ├── typography.ts
│   └── spacing.ts
└── types/              # Tipos TypeScript
    └── index.ts
```

## ⚙️ Configuración inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar URL del backend

Editar el archivo `src/api/client.ts` y cambiar la URL base:

```typescript
const API_BASE_URL = 'https://tu-backend.com/api'; // ⚠️ CAMBIAR AQUÍ
```

### 3. Ajustar endpoints

En los archivos de servicios (`authApi.ts`, `propertiesApi.ts`, `mandatesApi.ts`), ajustar las rutas según tu backend:

```typescript
// Ejemplo en authApi.ts
await apiClient.post('/auth/login', { email, password }); // Ajustar ruta
```

### 4. Verificar tipos de datos

En `src/types/index.ts`, ajustar las interfaces según los modelos de tu backend:

```typescript
export interface Property {
  // Ajustar campos según tu modelo real
}
```

## 🚀 Ejecutar la aplicación

### Desarrollo

```bash
# Android
npm run android

# iOS (solo en macOS)
npm run ios

# Web
npm run web
```

### Expo Go

```bash
npx expo start
```

Escanear el QR con la app Expo Go en tu teléfono.

## 👥 Roles y permisos

### ASESOR
- Ver sus propiedades
- Crear nuevas propiedades (quedan en estado Pendiente)
- Editar sus propiedades
- Generar mandatos (solo si la propiedad está Aprobada)
- Subir documentación

### ADMIN
- Ver todas las propiedades
- Cambiar estado de propiedades (Pendiente → Aprobado/Rechazado)
- Agregar observaciones
- Todas las funciones de ASESOR

## 📊 Flujo de trabajo

1. **ASESOR** crea una propiedad → Estado: **Pendiente**
2. **ADMIN** revisa la propiedad y cambia el estado:
   - → **Aprobado**: El asesor puede generar mandato
   - → **Rechazado**: El asesor debe corregir
3. **ASESOR** genera mandato (solo si está Aprobado)
4. Se puede descargar/ver el PDF del mandato

## 🎨 Tema

La app usa un tema oscuro coherente con la aplicación web:

- **Fondo principal**: `#0F172A`
- **Tarjetas**: `#1E293B`
- **Primario**: `#1E40AF` (azul)
- **Estados**:
  - Pendiente: `#F59E0B` (amarillo/naranja)
  - Aprobado: `#10B981` (verde)
  - Rechazado: `#EF4444` (rojo)

## 📝 Notas importantes

- Los tokens se guardan en `AsyncStorage` de forma persistente
- El interceptor de Axios agrega automáticamente el token a todas las peticiones
- Si el token expira (401), se limpia automáticamente la sesión
- Los documentos se suben usando `FormData` con `multipart/form-data`

## 🔧 Personalización

### Cambiar colores

Editar `src/theme/colors.ts`:

```typescript
export const colors = {
  primary: '#TU_COLOR',
  // ...
};
```

### Agregar campos al formulario

1. Actualizar interface en `src/types/index.ts`
2. Agregar campo en `PropertyFormScreen.tsx`
3. Enviar en el DTO correspondiente

## 📦 Dependencias principales

- `react-native` - Framework mobile
- `expo` - Herramientas de desarrollo
- `@react-navigation/native` - Navegación
- `axios` - Cliente HTTP
- `@react-native-async-storage/async-storage` - Almacenamiento local
- `expo-document-picker` - Selector de archivos
- `@react-native-picker/picker` - Selector dropdown

## 🐛 Troubleshooting

### Error de conexión al backend
- Verificar que la URL en `client.ts` sea correcta
- Si usas emulador Android, usar `http://10.0.2.2:3000` en lugar de `localhost`
- Si usas dispositivo físico, usar la IP local de tu computadora

### Token no se envía
- Verificar que el interceptor de Axios esté configurado
- Revisar que el token se guardó correctamente en AsyncStorage

### Errores de tipos TypeScript
- Ajustar las interfaces en `src/types/index.ts` según tu backend

## 📄 Licencia

Coldwell Banker - Sistema Inmobiliario
