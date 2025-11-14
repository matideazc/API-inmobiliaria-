# ✅ Ajustes al Módulo de Documentos - Creación Automática de Carpetas

## 🎯 Problema Resuelto

**Antes:** Error `ENOENT: no such file or directory` al subir PDF porque la carpeta no existía

**Ahora:** Las carpetas se crean automáticamente al subir archivos

---

## 📝 DIFF de Archivos Modificados

### 1. `src/config/multer.config.ts`

```diff
import multer from 'multer';
import path from 'path';
+ import fs from 'fs';
import { Request } from 'express';

/**
 * Configuración de multer para subida de archivos PDF
 * 
 * Almacenamiento:
 * - Por ahora guarda los archivos localmente en: uploads/expedientes/{expedienteId}/
 * - TODO: Reemplazar por subida a OneDrive cuando esté listo
 * 
 * Validaciones:
 * - Solo acepta archivos PDF (application/pdf o .pdf)
 * - Genera nombres únicos con timestamp para evitar sobrescrituras
+ * - Crea carpetas automáticamente si no existen
 */

// Configuración del almacenamiento
const storage = multer.diskStorage({
  // Determinar la carpeta de destino según el expedienteId
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const expedienteId = req.body.expedienteId;
    
    if (!expedienteId) {
      cb(new Error('El campo expedienteId es obligatorio'), '');
      return;
    }

    // Carpeta: uploads/expedientes/{expedienteId}
    // TODO: Reemplazar por OneDrive - esta carpeta será temporal
    const uploadPath = path.join('uploads', 'expedientes', expedienteId.toString());
    
+   // Crear la carpeta si no existe (recursive: true crea toda la ruta)
+   if (!fs.existsSync(uploadPath)) {
+     fs.mkdirSync(uploadPath, { recursive: true });
+   }
    
    cb(null, uploadPath);
  },
  
  // ... resto del código sin cambios
```

**Cambios:**

- ✅ Importado `fs` de Node.js
- ✅ Agregada verificación `fs.existsSync(uploadPath)`
- ✅ Creación automática con `fs.mkdirSync(uploadPath, { recursive: true })`
- ✅ `recursive: true` crea toda la ruta (uploads/expedientes/{id})

---

### 2. `src/controllers/documentos.controller.ts`

```diff
    // ========== MODO 1: ARCHIVO SUBIDO (multipart/form-data) ==========
    
    if (esArchivoSubido) {
      const archivo = req.file!;

      // El tipo es opcional, por defecto es PDF_COMPLETO
      const tipoDocumento = tipo || 'PDF_COMPLETO';

      // Validar que el tipo sea permitido
      if (!TIPOS_DOCUMENTO.includes(tipoDocumento as TipoDocumento)) {
        res.status(400).json({
          error: `Tipo de documento inválido. Tipos permitidos: ${TIPOS_DOCUMENTO.join(', ')}`
        });
        return;
      }

-     // Construir la ruta del archivo guardado
-     // Formato: uploads/expedientes/{expedienteId}/{filename}
-     const rutaArchivo = path.join('uploads', 'expedientes', expId.toString(), archivo.filename);
-
-     // Crear directorio si no existe
-     const dirPath = path.join('uploads', 'expedientes', expId.toString());
-     if (!fs.existsSync(dirPath)) {
-       fs.mkdirSync(dirPath, { recursive: true });
-     }
+     // Usar la ruta del archivo que ya guardó multer
+     // Normalizar las barras invertidas de Windows a barras normales
+     const rutaArchivo = archivo.path.replace(/\\/g, '/');

      // Crear el documento en la base de datos
      const nuevoDocumento = await prisma.documento.create({
        data: {
          expedienteId: expId,
          tipo: tipoDocumento,
          nombre: nombre?.trim() || archivo.originalname,
          rutaArchivo: rutaArchivo
        },
        // ... resto sin cambios
```

**Cambios:**

- ❌ Eliminada construcción manual de ruta con `path.join()`
- ❌ Eliminada creación redundante de directorio (ya lo hace multer)
- ✅ Usamos `archivo.path` que multer ya generó
- ✅ Normalizamos barras invertidas de Windows: `replace(/\\/g, '/')`
- ✅ Resultado: `uploads/expedientes/1/expediente-1-2025-11-11T19-30-45.pdf`

---

### 3. `src/routes/documentos.routes.ts`

**Sin cambios** - Ya estaba correcto con:

- `autenticar` → `middleware condicional de multer` → `crearDocumento`

---

### 4. `.gitignore`

```diff
# Database
*.db
*.db-journal
prisma/migrations/

/src/generated/prisma

+ # Uploads (archivos PDF subidos por usuarios)
+ uploads/
+ !uploads/.gitkeep
```

**Cambios:**

- ✅ Ignorar toda la carpeta `uploads/`
- ✅ Excepto el archivo `.gitkeep` para mantener la estructura

---

### 5. `uploads/.gitkeep` (nuevo archivo)

```
# Este archivo mantiene la carpeta uploads/ en el repositorio
# Los archivos PDF subidos por usuarios serán ignorados por .gitignore
```

**Propósito:**

- Mantener la carpeta `uploads/` en Git
- Los PDFs no se subirán al repo

---

## 🧪 Ejemplo de Request en Postman

### Configuración de la Request

**Method:** `POST`

**URL:** `http://localhost:3000/documentos`

**Headers:**

```
Authorization: Bearer TU_TOKEN_JWT_AQUI
```

**Body:**

- Tipo: `form-data` (⚠️ NO usar `x-www-form-urlencoded`)

| KEY | VALUE | TYPE |
|-----|-------|------|
| `expedienteId` | `1` | Text |
| `tipo` | `PDF_COMPLETO` | Text |
| `nombre` | `Expediente completo Casa Belgrano` | Text (opcional) |
| `archivo` | [Seleccionar archivo PDF] | File |

### Screenshot de Postman

```
Headers:
┌──────────────────┬──────────────────────────────────────────┐
│ Authorization    │ Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...  │
└──────────────────┴──────────────────────────────────────────┘

Body: form-data
┌──────────────────┬────────────┬──────────────────────────────┐
│ KEY              │ TYPE       │ VALUE                        │
├──────────────────┼────────────┼──────────────────────────────┤
│ expedienteId     │ Text       │ 1                            │
│ tipo             │ Text       │ PDF_COMPLETO                 │
│ nombre           │ Text       │ Expediente Casa Belgrano     │
│ archivo          │ File       │ [documento.pdf]              │
└──────────────────┴────────────┴──────────────────────────────┘
```

### Respuesta Exitosa

```json
{
  "mensaje": "Documento subido y creado exitosamente",
  "documento": {
    "id": 5,
    "expedienteId": 1,
    "tipo": "PDF_COMPLETO",
    "nombre": "Expediente completo Casa Belgrano",
    "rutaArchivo": "uploads/expedientes/1/expediente-1-2025-11-11T19-30-45.pdf",
    "createdAt": "2025-11-11T19:30:45.123Z",
    "expediente": {
      "id": 1,
      "titulo": "Venta Propiedad Belgrano",
      "propietarioNombre": "Juan Pérez"
    }
  },
  "archivoInfo": {
    "nombreOriginal": "documento.pdf",
    "tamaño": 1245678,
    "mimetype": "application/pdf",
    "rutaLocal": "uploads/expedientes/1/expediente-1-2025-11-11T19-30-45.pdf"
  }
}
```

---

## 🧪 Ejemplo con cURL (PowerShell)

```powershell
# Variables
$token = "TU_TOKEN_JWT_AQUI"
$archivoPDF = "C:\Users\Usuario\Documents\expediente.pdf"

# Request
curl -X POST "http://localhost:3000/documentos" `
  -H "Authorization: Bearer $token" `
  -F "expedienteId=1" `
  -F "tipo=PDF_COMPLETO" `
  -F "nombre=Expediente completo Casa Belgrano" `
  -F "archivo=@$archivoPDF"
```

---

## 🧪 Ejemplo con cURL (Bash/Linux/Mac)

```bash
curl -X POST "http://localhost:3000/documentos" \
  -H "Authorization: Bearer TU_TOKEN_JWT_AQUI" \
  -F "expedienteId=1" \
  -F "tipo=PDF_COMPLETO" \
  -F "nombre=Expediente completo Casa Belgrano" \
  -F "archivo=@/ruta/al/archivo.pdf"
```

---

## ✅ Validaciones que Siguen Funcionando

### Validación 1: expedienteId obligatorio

```json
// Request sin expedienteId
{
  "error": "El campo expedienteId es obligatorio"
}
```

### Validación 2: Solo archivos PDF

```json
// Al subir un .jpg o .docx
{
  "error": "Solo se permiten archivos PDF"
}
```

### Validación 3: Archivo muy grande (>10MB)

```json
{
  "error": "File too large"
}
```

### Validación 4: Expediente no existe

```json
// expedienteId = 999 (no existe)
{
  "error": "El expediente especificado no existe"
}
```

### Validación 5: Sin autenticación

```json
// Sin header Authorization
{
  "error": "Token no proporcionado"
}
```

---

## 🔄 Compatibilidad con Modo JSON (sin cambios)

El modo JSON sigue funcionando exactamente igual:

```powershell
$body = @{
  expedienteId = 1
  tipo = "DNI"
  nombre = "DNI del propietario"
  rutaArchivo = "https://onedrive.com/documents/dni-123.pdf"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/documentos" `
  -Method Post `
  -Headers @{Authorization = "Bearer $token"} `
  -Body $body `
  -ContentType "application/json"
```

**Respuesta:**

```json
{
  "mensaje": "Documento creado exitosamente",
  "documento": {
    "id": 6,
    "expedienteId": 1,
    "tipo": "DNI",
    "nombre": "DNI del propietario",
    "rutaArchivo": "https://onedrive.com/documents/dni-123.pdf",
    "createdAt": "2025-11-11T19:35:00.000Z",
    "expediente": { ... }
  }
}
```

---

## 📊 Estructura de Carpetas Generada

Después de subir varios archivos:

```
coldwell-banker-api/
├── uploads/
│   ├── .gitkeep
│   └── expedientes/
│       ├── 1/
│       │   ├── expediente-1-2025-11-11T18-30-45.pdf
│       │   └── expediente-1-2025-11-11T19-15-22.pdf
│       ├── 2/
│       │   └── expediente-2-2025-11-11T20-00-10.pdf
│       └── 3/
│           └── expediente-3-2025-11-11T20-30-55.pdf
```

**Nota:** Las subcarpetas (1/, 2/, 3/) se crean automáticamente al subir el primer archivo de cada expediente.

---

## ✅ Checklist de Cambios

- ✅ `src/config/multer.config.ts` - Agregado `fs.mkdirSync()` para crear carpetas
- ✅ `src/controllers/documentos.controller.ts` - Usar `archivo.path` y normalizar barras
- ✅ `.gitignore` - Ignorar carpeta `uploads/` excepto `.gitkeep`
- ✅ `uploads/.gitkeep` - Mantener estructura en repo
- ✅ Servidor compila sin errores
- ✅ Compatibilidad con modo JSON intacta
- ✅ No se tocaron otras rutas (expedientes, mandatos, auth)
- ✅ Middleware `autenticar` sigue en su lugar

---

## 🎉 Resultado Final

**Antes:**

```
❌ Error: ENOENT: no such file or directory, open 'uploads\expedientes\1\...'
```

**Ahora:**

```
✅ Carpeta creada automáticamente
✅ Archivo guardado: uploads/expedientes/1/expediente-1-2025-11-11T19-30-45.pdf
✅ Registro en BD con ruta normalizada
✅ Respuesta exitosa con info del archivo
```

---

**🚀 ¡Listo para probar en Postman!**
