# Pantalla de Nuevo Expediente

## 📋 Resumen

Se agregó la funcionalidad para crear nuevos expedientes desde el frontend. Cualquier usuario autenticado (ADMIN, REVISOR o ASESOR) puede crear expedientes.

## 🗂️ Archivos creados

### 1. `src/pages/NewExpediente.tsx`
Componente React para el formulario de creación de expedientes.

**Campos del formulario**:
- `titulo` (obligatorio, max 200 caracteres)
- `propietarioNombre` (obligatorio, max 150 caracteres)
- `descripcion` (opcional, max 500 caracteres, con contador)

**Comportamiento**:
- Envía POST a `/expedientes` con estado fijo `"PENDIENTE"`
- Si `descripcion` está vacía, no se incluye en el body
- Al crear exitosamente, redirige a `/expedientes/{id}` (detalle del expediente)
- Botón "Cancelar" vuelve a `/expedientes`
- Validaciones:
  * Título y propietario son obligatorios
  * Espacios en blanco se recortan con `.trim()`
  * Máximos de caracteres controlados con `maxLength`

### 2. `src/pages/NewExpediente.module.css`
Estilos siguiendo el tema oscuro del proyecto.

**Características**:
- Contenedor máximo 600px, centrado
- Card con padding 2.5rem
- Inputs y textarea con background `var(--bg-secondary)`
- Botones con colores consistentes:
  * Cancelar: gris (#6b7280)
  * Crear: azul (var(--accent-blue))
- Contador de caracteres para descripción (500/500)
- Info box con ícono ℹ️ explicando que el estado será PENDIENTE
- Responsive: en mobile, botones en columna

## 📝 Archivos modificados

### 3. `src/App.tsx`

**Cambios**:
- Importa `NewExpediente`
- Agrega ruta protegida: `/expedientes/nuevo`
- **IMPORTANTE**: La ruta `/expedientes/nuevo` está ANTES de `/expedientes/:id` para que no se confunda con un id

```tsx
<Route element={<ProtectedRoute />}>
  <Route path="/expedientes" element={<ExpedientesList />} />
  <Route path="/expedientes/nuevo" element={<NewExpediente />} />  {/* ANTES */}
  <Route path="/expedientes/:id" element={<ExpedienteDetail />} />
  <Route path="/expedientes/:expedienteId/upload" element={<UploadDocument />} />
</Route>
```

### 4. `src/pages/ExpedientesList.tsx`

**Cambios**:
- Botón "➕ Nuevo expediente" en el header (verde #10b981)
- Al hacer clic, navega a `/expedientes/nuevo`
- El botón está junto al de "Cerrar sesión"

**Layout del header**:
```
Expedientes                   [➕ Nuevo expediente] [Cerrar sesión]
👤 Nombre (ROL)
```

## 🎯 Permisos

- ✅ **ADMIN**: Puede crear expedientes
- ✅ **REVISOR**: Puede crear expedientes
- ✅ **ASESOR**: Puede crear expedientes

**No hay restricción por rol** en esta pantalla. Cualquier usuario autenticado puede crear expedientes.

## 🔄 Flujo de creación

```
1. Usuario hace clic en "➕ Nuevo expediente" en /expedientes
2. Navega a /expedientes/nuevo
3. Completa el formulario (título, propietario, descripción opcional)
4. Hace clic en "✅ Crear expediente"
5. POST a /expedientes con:
   {
     "titulo": "Casa en 9 de Julio",
     "propietarioNombre": "Juan Pérez",
     "descripcion": "Documentación del cliente",  // solo si no está vacío
     "estado": "PENDIENTE"
   }
6. Backend responde con el expediente creado (incluye id)
7. Frontend redirige a /expedientes/{id}
8. En el detalle, el usuario puede hacer clic en "📄 Subir documento"
```

## 🎨 UI/UX

### Elementos visuales:
- **Título**: "Crear nuevo expediente"
- **Subtítulo**: Explicación breve del flujo
- **Campos con asterisco rojo** (*) para obligatorios
- **Contador de caracteres** en descripción (Ej: "245/500")
- **Info box azul** al final explicando que el estado será PENDIENTE
- **Botones**:
  * Cancelar (gris, flex: 1)
  * Crear expediente (azul, flex: 2, más ancho)

### Estados:
- **Loading**: Botón muestra "Creando…" y se deshabilita
- **Error**: Banner rojo con ❌ y mensaje de la API
- **Inputs deshabilitados** mientras está en loading

### Responsive:
- En mobile (<640px):
  * Card con padding reducido (1.5rem)
  * Botones en columna (no en fila)
  * Título más pequeño (1.5rem)

## ✅ Validaciones

### Frontend:
- Título no puede estar vacío
- Propietario no puede estar vacío
- Descripción es opcional
- Caracteres máximos: titulo 200, propietario 150, descripción 500

### Backend (esperado):
- El backend debe validar que el usuario esté autenticado (JWT)
- Puede agregar validaciones adicionales de negocio
- Debe retornar el expediente creado con su `id`

## 🧪 Cómo probar

### Caso 1: Crear expediente completo
```
1. Login como cualquier usuario
2. En /expedientes, clic en "➕ Nuevo expediente"
3. Completar todos los campos (incluyendo descripción)
4. Clic en "✅ Crear expediente"
5. ✅ DEBE redirigir a /expedientes/{id}
6. ✅ DEBE mostrar el título, propietario, descripción
7. ✅ Estado DEBE ser "PENDIENTE"
```

### Caso 2: Crear expediente sin descripción
```
1. Completar solo título y propietario
2. Dejar descripción vacía
3. Clic en "✅ Crear expediente"
4. ✅ El body NO debe incluir "descripcion"
5. ✅ DEBE funcionar correctamente
```

### Caso 3: Validación de campos obligatorios
```
1. Dejar título vacío
2. Clic en "✅ Crear expediente"
3. ✅ DEBE mostrar error "El título es obligatorio"
4. ✅ NO debe hacer el POST
```

### Caso 4: Cancelar
```
1. Empezar a llenar el formulario
2. Clic en "Cancelar"
3. ✅ DEBE volver a /expedientes
4. ✅ Los datos se pierden (no se guardan)
```

### Caso 5: Error del backend
```
1. Simular error del backend (ej: servidor caído)
2. ✅ DEBE mostrar banner rojo con el mensaje de error
3. ✅ Botón vuelve a estar habilitado
4. ✅ Usuario puede intentar de nuevo
```

## 📦 Body enviado al backend

```json
{
  "titulo": "Casa en 9 de Julio",
  "propietarioNombre": "Juan Pérez",
  "descripcion": "Documentación que envió el cliente",
  "estado": "PENDIENTE"
}
```

**Si descripción está vacía**:
```json
{
  "titulo": "Casa en 9 de Julio",
  "propietarioNombre": "Juan Pérez",
  "estado": "PENDIENTE"
}
```

## 🚀 Próximos pasos sugeridos

1. Agregar selector de "tipo de propiedad" (casa, departamento, terreno)
2. Agregar campo de dirección
3. Agregar campo de monto estimado
4. Implementar borrador (guardar sin enviar)
5. Agregar validación de duplicados (mismo título + propietario)
6. Permitir subir documentos directamente desde esta pantalla (wizard multi-paso)
