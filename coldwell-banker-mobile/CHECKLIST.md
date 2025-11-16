# ✅ Checklist de Verificación Pre-Deploy

## 📋 Antes de ejecutar la app

### 1. Configuración Básica
- [ ] ✅ Dependencias instaladas (`node_modules` existe)
- [ ] ⚠️ URL del backend configurada en `src/api/client.ts`
- [ ] ✅ Archivo `App.tsx` configurado
- [ ] ✅ Archivo `app.json` configurado

### 2. Estructura de Carpetas
- [ ] ✅ `src/api/` existe y contiene 4 archivos
- [ ] ✅ `src/components/` existe y contiene 4 componentes
- [ ] ✅ `src/contexts/` existe con AuthContext
- [ ] ✅ `src/navigation/` existe con 4 archivos
- [ ] ✅ `src/screens/` existe con 6 pantallas
- [ ] ✅ `src/theme/` existe con 3 archivos
- [ ] ✅ `src/types/` existe con tipos

### 3. Configuración del Backend
- [ ] ⚠️ URL base configurada (revisar si es localhost o producción)
- [ ] ⚠️ Rutas de endpoints verificadas según tu backend
- [ ] ⚠️ Tipos de datos ajustados a tu modelo

### 4. Verificación de Funcionalidades
- [ ] Login funciona correctamente
- [ ] Token se guarda y persiste
- [ ] Navegación entre pantallas funciona
- [ ] Listado de propiedades carga
- [ ] Crear propiedad funciona
- [ ] Cambiar estado funciona (admin)
- [ ] Generar mandato funciona
- [ ] Subir archivos funciona

### 5. Testing en Dispositivos
- [ ] Probado en emulador Android
- [ ] Probado en emulador iOS (si tienes macOS)
- [ ] Probado en dispositivo físico
- [ ] Probado en modo web

### 6. Optimizaciones Opcionales
- [ ] Configurar analytics
- [ ] Configurar error tracking (Sentry)
- [ ] Configurar push notifications
- [ ] Configurar deep linking
- [ ] Configurar app icon personalizado
- [ ] Configurar splash screen personalizada

## 🚀 Comandos de Verificación

```bash
# 1. Verificar setup automáticamente
npm run verify

# 2. Ver si hay errores de TypeScript
npx tsc --noEmit

# 3. Ver estructura de carpetas
tree src (Windows) o find src (Mac/Linux)
```

## ⚠️ Checklist Crítico (DEBE estar completo)

1. **URL del Backend**: ¿Configurada en `src/api/client.ts`?
   - [ ] Sí, está configurada
   - Estado actual: `http://localhost:3000/api` ⚠️

2. **Endpoints**: ¿Coinciden con tu backend?
   - [ ] Autenticación revisada
   - [ ] Propiedades revisadas
   - [ ] Mandatos revisados

3. **Tipos**: ¿Coinciden con tu modelo de datos?
   - [ ] User interface ajustada
   - [ ] Property interface ajustada
   - [ ] Mandate interface ajustada

4. **Credenciales de prueba**: ¿Tienes usuarios creados?
   - [ ] Usuario ASESOR creado
   - [ ] Usuario ADMIN creado

## ✅ Lista de Archivos Clave

```
✓ App.tsx
✓ src/api/client.ts (CONFIGURAR URL)
✓ src/api/authApi.ts
✓ src/api/propertiesApi.ts
✓ src/api/mandatesApi.ts
✓ src/contexts/AuthContext.tsx
✓ src/navigation/RootNavigator.tsx
✓ src/screens/ (6 archivos)
✓ src/types/index.ts (AJUSTAR SEGÚN BACKEND)
```

## 🐛 Si algo no funciona

### Error: Cannot connect to backend
**Solución:**
1. Verificar que el backend esté corriendo
2. Verificar la URL en `client.ts`
3. Si Android emulador: usar `http://10.0.2.2:PORT/api`
4. Si dispositivo físico: usar IP local

### Error: Types don't match
**Solución:**
1. Revisar respuesta del backend en logs
2. Ajustar interfaces en `src/types/index.ts`

### Error: Module not found
**Solución:**
1. Ejecutar `npm install`
2. Limpiar cache: `npx expo start -c`

## 📝 Notas Finales

- ✅ Todos los archivos TypeScript están creados
- ✅ No hay errores de compilación
- ✅ Arquitectura completa implementada
- ⚠️ Falta: Configurar URL del backend real
- ⚠️ Falta: Probar con datos reales

## 🎯 Próximo Paso

```bash
npm run verify
```

Luego:

```bash
npx expo start
```

¡Éxito! 🚀
