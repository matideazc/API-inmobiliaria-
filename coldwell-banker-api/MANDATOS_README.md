# 📄 Sistema de Mandatos - Documentación Final

## 🎯 Funcionamiento

El sistema genera PDFs de mandatos **dinámicamente** cada vez que se solicitan, sin necesidad de subirlos manualmente.

---

## 📋 Endpoints Disponibles

### 1. Crear Mandato

```
POST /expedientes/:id/mandato
```

**Permisos:** ASESOR (solo sus expedientes), REVISOR, ADMIN

**Body:**

```json
{
  "plazoDias": 90,
  "monto": 3500000,
  "observaciones": "Mandato de venta exclusiva"
}
```

**Respuesta:**

```json
{
  "mensaje": "Mandato creado exitosamente",
  "mandato": {
    "id": 1,
    "expedienteId": 21,
    "plazoDias": 90,
    "monto": 3500000,
    "estado": "BORRADOR",
    ...
  }
}
```

---

### 2. Obtener Mandato

```
GET /expedientes/:id/mandato
```

**Permisos:** ASESOR (solo sus expedientes), REVISOR, ADMIN

**Respuesta:**

```json
{
  "id": 1,
  "expedienteId": 21,
  "plazoDias": 90,
  "monto": 3500000,
  "estado": "BORRADOR",
  "observaciones": "...",
  "firmadoPor": null,
  "firmadoFecha": null,
  "documentoUrl": null,
  "createdAt": "2025-11-13T...",
  "updatedAt": "2025-11-13T..."
}
```

---

### 3. Descargar PDF del Mandato ⭐ (Generación Automática)

```
GET /expedientes/:id/mandato/pdf
```

**Permisos:** ASESOR (solo sus expedientes), REVISOR, ADMIN

**Comportamiento:**

- ✅ Genera el PDF automáticamente con los datos del mandato
- ✅ No requiere que el mandato tenga `documentoUrl`
- ✅ Descarga con nombre: `mandato-expediente-{id}.pdf`
- ✅ Incluye toda la información del expediente y mandato

**Contenido del PDF:**

- Logo/Header "MANDATO DE VENTA - Coldwell Banker"
- Datos del expediente (ID, título, propietario, estado, descripción)
- Datos del mandato (ID, plazo, monto, estado, observaciones)
- Fecha de creación
- Datos de firma (si está firmado)
- Información del asesor responsable
- Pie de página con fecha de generación

---

### 4. Actualizar Estado del Mandato

```
PUT /mandatos/:id/estado
```

**Permisos:** Solo ADMIN

**Body:**

```json
{
  "estado": "FIRMADO",
  "firmadoPor": "Carlos Saul",
  "documentoUrl": "https://..."  // Opcional
}
```

**Respuesta:**

```json
{
  "mensaje": "Estado del mandato actualizado exitosamente",
  "mandato": {
    "id": 1,
    "estado": "FIRMADO",
    "firmadoPor": "Carlos Saul",
    "firmadoFecha": "2025-11-13T...",
    ...
  }
}
```

---

## 🔐 Matriz de Permisos

| Endpoint | ASESOR | REVISOR | ADMIN |
|----------|--------|---------|-------|
| POST /expedientes/:id/mandato | ✅ (solo sus expedientes) | ✅ Todos | ✅ Todos |
| GET /expedientes/:id/mandato | ✅ (solo suyos) | ✅ Todos | ✅ Todos |
| GET /expedientes/:id/mandato/pdf | ✅ (solo suyos) | ✅ Todos | ✅ Todos |
| PUT /mandatos/:id/estado | ❌ | ❌ | ✅ |

---

## 📊 Estados del Mandato

| Estado | Descripción |
|--------|-------------|
| `BORRADOR` | Recién creado, sin firmar |
| `ENVIADO` | Enviado al cliente para firma |
| `FIRMADO` | Firmado por el cliente |
| `ANULADO` | Cancelado/anulado |

---

## 🎨 Integración con Frontend

### Verificar si hay mandato

```typescript
const expediente = await api.get(`/expedientes/${id}`);

if (expediente.mandato) {
  // Mostrar botón "Descargar Mandato"
  console.log('Mandato ID:', expediente.mandato.id);
  console.log('Estado:', expediente.mandato.estado);
}
```

### Descargar PDF del Mandato

```typescript
const descargarMandato = async (expedienteId: number) => {
  try {
    const response = await api.get(
      `/expedientes/${expedienteId}/mandato/pdf`,
      { responseType: 'blob' }
    );

    // Crear blob y descargar
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mandato-expediente-${expedienteId}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al descargar mandato:', error);
  }
};
```

### Crear Mandato

```typescript
const crearMandato = async (expedienteId: number) => {
  const data = {
    plazoDias: 90,
    monto: 3500000,
    observaciones: 'Mandato de venta exclusiva'
  };

  const response = await api.post(`/expedientes/${expedienteId}/mandato`, data);
  console.log('Mandato creado:', response.data.mandato);
};
```

---

## ✅ Ventajas del Sistema Actual

1. **🚀 Generación Automática**: El PDF se genera dinámicamente, no necesitás subirlo
2. **🌍 Universal**: Funciona para todos los expedientes automáticamente
3. **🔒 Seguro**: Validación de permisos en cada endpoint
4. **📝 Completo**: PDF profesional con toda la información
5. **⚡ Rápido**: Generación instantánea sin almacenamiento
6. **🧹 Limpio**: No requiere carpetas de uploads para mandatos
7. **👥 Simple**: Frontend solo necesita llamar al endpoint

---

## 🛠️ Tecnologías Utilizadas

- **pdfkit**: Generación dinámica de PDFs
- **Node.js + Express**: Backend API REST
- **Prisma**: ORM para base de datos
- **TypeScript**: Tipado estático
- **JWT**: Autenticación y autorización

---

## 📌 Notas Importantes

- ✅ El PDF se genera **siempre que se solicite**, no se guarda
- ✅ No se requiere el campo `documentoUrl` para generar el PDF
- ✅ El `documentoUrl` es opcional y puede usarse para URLs externas (OneDrive)
- ✅ Los ASESORES solo ven mandatos de sus propios expedientes
- ✅ ADMIN y REVISOR ven todos los mandatos

---

## 🎯 Flujo Completo de Uso

1. **Crear expediente** → Estado: PENDIENTE
2. **ADMIN/REVISOR aprueba** → Estado: APROBADO
3. **Crear mandato** → Estado: BORRADOR
4. **Descargar PDF** → PDF generado automáticamente ✨
5. **(Opcional) Actualizar estado** → ENVIADO → FIRMADO

---

## 🔧 Mantenimiento

### Verificar mandatos existentes

```bash
node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.mandato.findMany().then(m=>console.log(JSON.stringify(m,null,2))).finally(()=>p.$disconnect());"
```

### Ver expedientes con mandato

```bash
node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.expediente.findMany({include:{mandato:true}}).then(e=>console.log(JSON.stringify(e.filter(x=>x.mandato),null,2))).finally(()=>p.$disconnect());"
```

---

✅ **Sistema de Mandatos implementado y funcionando correctamente**
