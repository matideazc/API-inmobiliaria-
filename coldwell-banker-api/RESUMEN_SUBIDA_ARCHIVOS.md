# ✅ Resumen de Cambios - Subida de Archivos PDF

## 📦 Dependencias Instaladas

- ✅ `multer@1.4.5-lts.1` - Middleware para manejo de archivos multipart/form-data
- ✅ `@types/multer@1.4.12` - Tipos de TypeScript para multer

---

## 📁 Archivos Nuevos Creados

### 1. `src/config/multer.config.ts`

**Propósito:** Configuración de multer para subida de archivos PDF

**Funcionalidad:**

- Almacenamiento en disco: `uploads/expedientes/{expedienteId}/`
- Nombres únicos: `expediente-{id}-{timestamp}.pdf`
- Validación: Solo archivos PDF (mimetype y extensión)
- Límite de tamaño: 10MB
- Exporta: `uploadSinglePDF` (middleware para un solo archivo)

**TODO marcado:**

```typescript
// TODO: Reemplazar por OneDrive - esta carpeta será temporal
// TODO: Ajustar este límite según las necesidades
// Para archivos muy grandes (>10MB) considerar streaming o chunks
```

---

### 2. `uploads/.gitignore`

**Propósito:** Evitar subir archivos de usuarios al repositorio

**Contenido:**

```
# Ignorar todos los archivos subidos
*
# Pero mantener el directorio
!.gitignore
```

---

### 3. `uploads/expedientes/` (directorio)

**Propósito:** Carpeta donde se guardan los PDFs subidos

**Estructura:** `uploads/expedientes/{expedienteId}/{filename}.pdf`

---

## 🔧 Archivos Modificados

### 1. `prisma/schema.prisma`

**Cambio:** Agregado nuevo tipo al enum `DocTipo`

```prisma
enum DocTipo {
  ESCRITURA
  DNI
  API
  TGI
  PLANOS
  MENSURA
  TASA
  OTRO
  PDF_COMPLETO  // ← NUEVO: PDF único con toda la info de la propiedad
}
```

**Migración:** No fue necesaria (Prisma detectó que ya estaba en sync)

---

### 2. `src/controllers/documentos.controller.ts`

**Cambios principales:**

#### a) Imports agregados

```typescript
import fs from 'fs';
import path from 'path';
```

#### b) Tipo `PDF_COMPLETO` agregado al array

```typescript
const TIPOS_DOCUMENTO = [
  'ESCRITURA',
  'DNI',
  'API',
  'TGI',
  'PLANOS',
  'MENSURA',
  'TASA',
  'OTRO',
  'PDF_COMPLETO'  // ← NUEVO
] as const;
```

#### c) Función `crearDocumento()` completamente reescrita

**ANTES:** Solo soportaba JSON con `rutaArchivo`

**AHORA:** Soporta 2 modos:

**MODO 1 - JSON (compatibilidad):**

- Content-Type: `application/json`
- Campos: `expedienteId`, `tipo`, `nombre?`, `rutaArchivo`
- Uso: URLs de OneDrive o rutas externas

**MODO 2 - UPLOAD (nuevo):**

- Content-Type: `multipart/form-data`
- Campos: `expedienteId`, `tipo?` (default: PDF_COMPLETO), `nombre?`, `archivo` (file)
- Validaciones: Solo PDF, máximo 10MB
- Guarda en: `uploads/expedientes/{expedienteId}/`
- Crea directorio automáticamente si no existe

**Lógica de detección:**

```typescript
const esArchivoSubido = req.file !== undefined;

if (esArchivoSubido) {
  // Modo UPLOAD - procesa el archivo
} else {
  // Modo JSON - procesa la URL
}
```

**Respuesta extendida para modo UPLOAD:**

```typescript
{
  mensaje: "Documento subido y creado exitosamente",
  documento: { ... },
  archivoInfo: {
    nombreOriginal: "...",
    tamaño: 2458624,
    mimetype: "application/pdf",
    rutaLocal: "uploads/..."
  }
}
```

---

### 3. `src/routes/documentos.routes.ts`

**Cambios principales:**

#### a) Import de multer

```typescript
import { uploadSinglePDF } from '../config/multer.config';
```

#### b) Middleware condicional en POST /documentos

**ANTES:**

```typescript
router.post('/', autenticar, crearDocumento);
```

**AHORA:**

```typescript
router.post('/', 
  autenticar, 
  (req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Aplicar multer solo si es multipart
      uploadSinglePDF(req, res, (err) => {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }
        next();
      });
    } else {
      // Modo JSON, pasar directo al controller
      next();
    }
  },
  crearDocumento
);
```

**Beneficio:** El mismo endpoint soporta ambos formatos sin romper compatibilidad

---

### 4. `PRUEBAS_DOCUMENTOS.md`

**Cambios principales:**

#### a) Sección nueva al inicio

```markdown
## 🚀 IMPORTANTE: Dos formas de crear documentos

### 🔹 Modo 1: JSON (URLs de OneDrive)
### 🔹 Modo 2: UPLOAD (Subida de archivo PDF)
```

#### b) Endpoint 2️⃣ dividido en dos secciones

- **2️⃣ Crear documento - MODO 1: JSON**
- **2️⃣-B Crear documento - MODO 2: UPLOAD**

#### c) Ejemplos de PowerShell actualizados

- **Paso 3A:** Crear documentos modo JSON (código existente)
- **Paso 3B:** Crear documento modo UPLOAD (NUEVO)
  - Ejemplo completo con `Invoke-RestMethod`
  - Ejemplo alternativo con `curl`

#### d) Documentación de validaciones

- Solo PDF
- Máximo 10MB
- expedienteId obligatorio
- tipo opcional (default: PDF_COMPLETO)

---

## 🔐 Validaciones Implementadas

### Validaciones de Multer (archivo)

- ✅ Solo archivos PDF (`application/pdf` o extensión `.pdf`)
- ✅ Tamaño máximo: 10MB
- ✅ Genera nombres únicos (no sobrescribe archivos)

### Validaciones del Controller

- ✅ expedienteId obligatorio (en ambos modos)
- ✅ expedienteId debe ser un número válido
- ✅ Expediente debe existir en la BD
- ✅ tipo opcional en modo UPLOAD (default: PDF_COMPLETO)
- ✅ tipo obligatorio en modo JSON
- ✅ tipo debe ser uno de los permitidos
- ✅ rutaArchivo obligatorio en modo JSON
- ✅ Crea directorio automáticamente si no existe

### Validaciones de Seguridad Mantenidas

- ✅ Autenticación JWT obligatoria (middleware `autenticar`)
- ✅ Usuario debe estar autenticado
- ✅ Todas las rutas protegidas
- ✅ DELETE solo para ADMIN

---

## 📊 Compatibilidad con Código Existente

### ✅ NO SE ROMPIÓ NADA

- ✅ Rutas de expedientes: **Sin cambios**
- ✅ Rutas de mandatos: **Sin cambios**
- ✅ Rutas de auth: **Sin cambios**
- ✅ Middleware autenticar: **Sin cambios**
- ✅ Middleware esAdmin: **Sin cambios**
- ✅ Modelo Documento en Prisma: **Sin cambios** (solo agregado enum)
- ✅ GET /documentos/:expedienteId: **Sin cambios**
- ✅ DELETE /documentos/:id: **Sin cambios**

### ✅ POST /documentos RETROCOMPATIBLE

El endpoint **POST /documentos** sigue funcionando con el formato JSON existente:

```json
{
  "expedienteId": 1,
  "tipo": "DNI",
  "nombre": "DNI del propietario",
  "rutaArchivo": "https://onedrive.com/..."
}
```

**Y ADEMÁS** ahora soporta subida de archivos:

```
Content-Type: multipart/form-data
Fields: expedienteId, tipo?, nombre?, archivo (file)
```

---

## 🚀 Cómo Usar (Resumen)

### Para URLs de OneDrive (modo tradicional)

```powershell
$body = @{
  expedienteId = 1
  tipo = "DNI"
  rutaArchivo = "https://onedrive.com/doc.pdf"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/documentos" `
  -Method Post `
  -Headers @{Authorization = "Bearer $token"} `
  -Body $body `
  -ContentType "application/json"
```

### Para subir un PDF desde el PC (modo nuevo)

```powershell
curl -X POST "http://localhost:3000/documentos" `
  -H "Authorization: Bearer $token" `
  -F "expedienteId=1" `
  -F "tipo=PDF_COMPLETO" `
  -F "archivo=@C:\ruta\al\archivo.pdf"
```

---

## 📝 TODOs Marcados en el Código

### 1. Integración con OneDrive

**Ubicación:** `src/config/multer.config.ts`

```typescript
// TODO: Reemplazar por OneDrive - esta carpeta será temporal
const uploadPath = path.join('uploads', 'expedientes', expedienteId.toString());
```

**Próximos pasos:**

- Implementar cliente de OneDrive API
- Reemplazar `multer.diskStorage` por upload a OneDrive
- Guardar URL de OneDrive en `rutaArchivo`
- Mantener la misma interfaz del controller

### 2. Límite de tamaño de archivo

**Ubicación:** `src/config/multer.config.ts`

```typescript
limits: {
  fileSize: 10 * 1024 * 1024 // Límite de 10MB
  // TODO: Ajustar este límite según las necesidades
  // Para archivos muy grandes (>10MB) considerar streaming o chunks
}
```

**Opciones futuras:**

- Aumentar límite si es necesario
- Implementar upload por chunks para archivos grandes
- Usar streaming para optimizar memoria

---

## 🎯 Estructura de Archivos Guardados

```
uploads/
└── expedientes/
    ├── 1/
    │   ├── expediente-1-2025-11-11T18-30-45.pdf
    │   └── expediente-1-2025-11-11T19-15-22.pdf
    ├── 2/
    │   └── expediente-2-2025-11-11T20-00-10.pdf
    └── .gitignore
```

**Formato de nombre:** `expediente-{id}-{timestamp}.pdf`

**Timestamp:** ISO 8601 con `:` reemplazados por `-`

**Ejemplo:** `expediente-5-2025-11-11T18-45-32.pdf`

---

## 🧪 Testing

### Pruebas recomendadas

1. ✅ **Crear documento con JSON (compatibilidad)**
   - Debe funcionar igual que antes
   - Validar que se guarde correctamente

2. ✅ **Subir PDF válido**
   - Archivo < 10MB
   - Extensión .pdf
   - Verificar que se cree el directorio
   - Verificar que se guarde el archivo
   - Verificar respuesta con `archivoInfo`

3. ✅ **Intentar subir archivo no-PDF**
   - Debe retornar error 400
   - Mensaje: "Solo se permiten archivos PDF"

4. ✅ **Intentar subir archivo muy grande**
   - Debe retornar error 400
   - Validar límite de 10MB

5. ✅ **Subir sin expedienteId**
   - Debe retornar error 400

6. ✅ **Subir con expedienteId inválido**
   - Debe retornar error 404

7. ✅ **Listar documentos**
   - Debe mostrar tanto documentos JSON como subidos

---

## 📊 Comparación Antes/Después

| Aspecto | ANTES | DESPUÉS |
|---------|-------|---------|
| **POST /documentos** | Solo JSON | JSON + Multipart |
| **Tipos de documento** | 8 tipos | 9 tipos (+ PDF_COMPLETO) |
| **Validación de archivos** | ❌ No | ✅ Solo PDF, max 10MB |
| **Almacenamiento** | Solo URLs | URLs + Archivos locales |
| **Compatibilidad** | - | ✅ 100% retrocompatible |
| **OneDrive ready** | Parcial | ✅ TODOs marcados |
| **Documentación** | Básica | Completa con ejemplos |

---

## ✅ Checklist Final

- ✅ Multer instalado y configurado
- ✅ Tipos de TypeScript instalados
- ✅ Configuración de multer creada (`src/config/multer.config.ts`)
- ✅ Enum `DocTipo` actualizado (+ PDF_COMPLETO)
- ✅ Controller actualizado con doble modo (JSON + Upload)
- ✅ Router actualizado con middleware condicional
- ✅ Directorio `uploads/` creado con `.gitignore`
- ✅ Documentación actualizada (`PRUEBAS_DOCUMENTOS.md`)
- ✅ Ejemplos de PowerShell agregados (JSON + Upload + curl)
- ✅ Validaciones implementadas (PDF, tamaño, expediente existe)
- ✅ TODOs marcados para integración OneDrive
- ✅ Servidor compila sin errores
- ✅ Compatibilidad 100% con código existente
- ✅ No se rompieron rutas ni middleware de otros módulos

---

## 🎉 Resultado Final

El backend ahora soporta:

1. **Modo tradicional (JSON):** Para URLs de OneDrive o archivos externos
2. **Modo nuevo (Upload):** Para PDFs que el asesor sube desde su PC
3. **Mismo endpoint:** POST /documentos detecta automáticamente el modo
4. **Totalmente retrocompatible:** El código existente sigue funcionando
5. **Preparado para OneDrive:** TODOs marcados para futura integración
6. **Documentación completa:** Ejemplos de PowerShell para ambos modos

---

**🚀 ¡TODO LISTO PARA USAR!**
