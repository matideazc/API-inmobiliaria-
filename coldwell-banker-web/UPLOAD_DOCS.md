# 📄 Funcionalidad de Subida de Documentos PDF

## ✅ Implementación completada

Se ha agregado una nueva funcionalidad para subir documentos PDF a los expedientes.

---

## 📁 Archivos creados/modificados

### Nuevos archivos:

- ✅ `src/pages/UploadDocument.tsx` - Componente de subida de documentos
- ✅ `src/pages/UploadDocument.module.css` - Estilos del componente

### Archivos modificados:

- ✅ `src/App.tsx` - Agregada ruta `/expedientes/:expedienteId/upload`
- ✅ `src/pages/ExpedienteDetail.tsx` - Botón para subir documentos
- ✅ `src/pages/ExpedienteDetail.module.css` - Estilos adicionales

---

## 🚀 Cómo usar

### Opción 1: Desde el detalle del expediente

1. Ir a un expediente específico: `/expedientes/:id`
2. Hacer clic en el botón **"📄 Subir documento"** (esquina superior derecha)
3. Seleccionar un archivo PDF
4. Hacer clic en **"Subir documento"**
5. Automáticamente redirige de vuelta al expediente

### Opción 2: URL directa

Navegar directamente a: `/expedientes/:expedienteId/upload`

Ejemplo: `/expedientes/1/upload`

---

## 🔧 Características técnicas

### Validaciones implementadas:

- ✅ Solo acepta archivos PDF
- ✅ Tamaño máximo: 10MB
- ✅ Validación en tiempo real al seleccionar archivo
- ✅ Mensajes de error descriptivos

### UX/UI:

- ✅ Spinner de carga durante el upload
- ✅ Mensajes de éxito/error con iconos
- ✅ Preview del archivo seleccionado (nombre + tamaño)
- ✅ Botón de subida deshabilitado hasta seleccionar archivo
- ✅ Redirección automática después de 2 segundos
- ✅ Diseño responsive y moderno

### Comunicación con el backend:

- ✅ Usa `FormData` para envío multipart/form-data
- ✅ Campos enviados:
  - `expedienteId` (number)
  - `tipo` ("PDF_COMPLETO")
  - `archivo` (File)
- ✅ Header `Content-Type: multipart/form-data` automático
- ✅ Token JWT incluido automáticamente (interceptor de axios)

---

## 📋 Flujo completo

```
1. Usuario en ExpedienteDetail
   ↓
2. Click en "Subir documento"
   ↓
3. Navega a /expedientes/:id/upload
   ↓
4. Selecciona archivo PDF
   ↓
5. Validación de tipo y tamaño
   ↓
6. Click en "Subir documento"
   ↓
7. POST a /documentos con FormData
   ↓
8. Muestra mensaje de éxito
   ↓
9. Redirige a /expedientes/:id
   ↓
10. Documento aparece en la lista
```

---

## 🎨 Estados del componente

### Estados de carga:

- `uploading: false` → Botón normal
- `uploading: true` → Spinner + texto "Subiendo..."

### Estados de validación:
- Sin archivo → Botón deshabilitado
- Archivo inválido (no PDF o >10MB) → Mensaje de error
- Archivo válido → Preview + botón habilitado

### Estados de respuesta:
- Error → Banner rojo con mensaje
- Éxito → Banner verde + redirección

---

## 🔐 Seguridad

- ✅ Ruta protegida (requiere autenticación)
- ✅ Token JWT automático en headers
- ✅ Validación de tipo de archivo en frontend
- ✅ Validación de tamaño en frontend
- ✅ El backend debe hacer sus propias validaciones también

---

## 🎯 Próximas mejoras sugeridas

- [ ] Agregar barra de progreso durante el upload
- [ ] Permitir múltiples archivos a la vez
- [ ] Preview del PDF antes de subir
- [ ] Drag & drop de archivos
- [ ] Comprimir PDFs grandes automáticamente
- [ ] Permitir otros tipos de documentos (imágenes, Word, etc.)

---

## 🧪 Para probar

1. Asegurate de tener el backend corriendo en `http://localhost:3000`
2. Asegurate de estar autenticado
3. Tener al menos un expediente creado
4. Navegar a `/expedientes/:id`
5. Hacer clic en "Subir documento"
6. Seleccionar un PDF de prueba
7. Verificar que se sube correctamente

---

## 📞 Integración con el backend

El componente hace una request así:

```typescript
const formData = new FormData();
formData.append('expedienteId', '1'); // ID del expediente
formData.append('tipo', 'PDF_COMPLETO');
formData.append('archivo', file); // File object

await api.post('/documentos', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

El backend debe responder:

```json
{
  "mensaje": "Documento subido y creado exitosamente",
  "documento": {
    "id": 2,
    "expedienteId": 1,
    "tipo": "PDF_COMPLETO",
    "rutaArchivo": "uploads/expedientes/1/expediente-1-2025-11-11T22-51-15.pdf"
  }
}
```

---

✅ **Todo listo para usar!**
