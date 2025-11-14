# MIGRATION NOTES - RBAC Implementation

## 📋 Resumen de Cambios

Esta implementación agrega permisos basados en roles (RBAC) tanto en frontend como backend para el sistema de gestión de expedientes Coldwell Banker.

### Cambios Principales

1. **Frontend (React + TypeScript + Vite)**
   - ✅ Utilidades de formateo (`src/utils/format.ts`)
   - ✅ Toggle "Mis expedientes" para ASESOR
   - ✅ Badges de rol (ADMIN verde, REVISOR azul, ASESOR gris)
   - ✅ Skeleton loading en lista de expedientes
   - ✅ Cards mejoradas con info de mandato
   - ✅ Sección de mandato completa en ExpedienteDetail

2. **Backend (Node.js + Express)**
   - 📝 Middleware RBAC (`rbac.middleware.js`)
   - 📝 Controladores con permisos (`expedientes.controller.js`, `mandatos.controller.js`)
   - 📝 Rutas protegidas con roles

---

## 🚀 Implementación Backend

### 1. Instalar Dependencias

Si aún no tienes JWT configurado:

\`\`\`bash
npm install jsonwebtoken
\`\`\`

### 2. Configurar Variables de Entorno

Agregar en tu archivo \`.env\` del backend:

\`\`\`env
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRES_IN=24h
\`\`\`

### 3. Implementar Middleware RBAC

Copiar el archivo \`backend-examples/rbac.middleware.js\` a tu proyecto backend:

\`\`\`
backend/
├── middleware/
│   └── rbac.js  ← Copiar aquí
\`\`\`

### 4. Actualizar Controladores

Reemplazar o actualizar tus controladores con la lógica de:
- \`backend-examples/expedientes.controller.js\`
- \`backend-examples/mandatos.controller.js\`

**Cambios clave en GET /expedientes:**
\`\`\`javascript
// Si es ASESOR, SIEMPRE filtrar por su ID
if (user.rol === 'ASESOR') {
  where.asesorId = user.id;
}
// Si ADMIN/REVISOR envían asesorId, respetarlo
else if (asesorId) {
  where.asesorId = parseInt(asesorId, 10);
}
\`\`\`

**Cambios clave en POST /mandatos:**
\`\`\`javascript
// 1. Solo ASESOR puede crear mandatos
if (user.rol !== 'ASESOR') {
  return res.status(403).json({ error: 'Solo asesores...' });
}

// 2. Expediente debe estar APROBADO
if (expediente.estado !== 'APROBADO') {
  return res.status(403).json({ error: 'Solo expedientes aprobados...' });
}

// 3. Expediente debe pertenecer al asesor
if (expediente.asesorId !== user.id) {
  return res.status(403).json({ error: 'No es tu expediente...' });
}
\`\`\`

### 5. Configurar Rutas

Actualizar tu archivo de rutas (ej: \`routes/index.js\`) siguiendo el ejemplo en:
\`backend-examples/routes.example.js\`

\`\`\`javascript
const { authenticateToken, requireRole } = require('./middleware/rbac');

// Todos autenticados
router.get('/expedientes', authenticateToken, expedientesController.getExpedientes);

// Solo ADMIN/REVISOR
router.patch('/expedientes/:id/estado', 
  authenticateToken, 
  requireRole(['ADMIN', 'REVISOR']),
  expedientesController.updateEstado
);

// Solo ASESOR
router.post('/mandatos', 
  authenticateToken, 
  requireRole(['ASESOR']),
  mandatosController.createMandato
);
\`\`\`

### 6. Actualizar Modelo de Usuario (Login)

Asegurar que al hacer login, el token JWT incluya:

\`\`\`javascript
const token = jwt.sign(
  {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol  // ← IMPORTANTE
  },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);
\`\`\`

---

## 🧪 Testing Manual

### Preparación

1. **Crear usuarios de prueba** con diferentes roles:
   - Usuario 1: ADMIN
   - Usuario 2: REVISOR
   - Usuario 3: ASESOR (id: 10)
   - Usuario 4: ASESOR (id: 11)

2. **Crear expedientes de prueba:**
   - Expediente A: estado PENDIENTE, asesorId: 10
   - Expediente B: estado APROBADO, asesorId: 10, sin mandato
   - Expediente C: estado APROBADO, asesorId: 11, con mandato

### Test 1: Login y Verificación de Rol

**Objetivo:** Verificar que el badge de rol aparece correctamente

1. Login como ADMIN
   - ✅ Badge debe ser verde con texto "ADMIN"
2. Login como REVISOR
   - ✅ Badge debe ser azul con texto "REVISOR"
3. Login como ASESOR
   - ✅ Badge debe ser gris con texto "ASESOR"

### Test 2: Toggle "Mis expedientes" (ASESOR)

**Objetivo:** Verificar filtrado de expedientes para ASESOR

1. Login como ASESOR (id: 10)
2. Ir a lista de expedientes
   - ✅ Toggle "Mis expedientes" debe estar visible
   - ✅ Toggle debe estar activado por defecto
   - ✅ Solo debe mostrar expedientes donde asesorId === 10
3. Desactivar toggle
   - ❌ **IMPORTANTE:** El backend seguirá filtrando, así que verá los mismos
   - ✅ Esto es correcto (seguridad server-side)

### Test 3: Toggle NO visible para ADMIN/REVISOR

**Objetivo:** Verificar que ADMIN y REVISOR no ven el toggle

1. Login como ADMIN
   - ✅ Toggle NO debe estar visible
   - ✅ Debe ver TODOS los expedientes
2. Login como REVISOR
   - ✅ Toggle NO debe estar visible
   - ✅ Debe ver TODOS los expedientes

### Test 4: Skeleton Loading

**Objetivo:** Verificar animaciones de carga

1. Login como cualquier usuario
2. Ir a lista de expedientes
3. Recargar página (F5)
   - ✅ Debe mostrar 4 tarjetas skeleton animadas
   - ✅ Animación de shimmer debe ser fluida
   - ✅ Al cargar, skeleton debe desaparecer

### Test 5: Cards con Mandato

**Objetivo:** Verificar resumen de mandato en cards

1. Login como ASESOR con expedientes aprobados
2. Ver un expediente que tiene mandato
   - ✅ Card debe mostrar chip verde con:
     - Icono 📄
     - "Mandato: $X.XXX ARS • 60 días"
     - "Vence: DD/MM/AAAA"
3. Ver un expediente sin mandato
   - ✅ NO debe mostrar chip de mandato

### Test 6: Crear Mandato (Happy Path)

**Objetivo:** ASESOR crea mandato en expediente aprobado propio

1. Login como ASESOR (id: 10)
2. Ir a Expediente B (APROBADO, asesorId: 10, sin mandato)
3. En la sección "Mandato":
   - ✅ Debe mostrar mensaje "Este expediente está aprobado..."
   - ✅ Debe mostrar botón "➕ Crear mandato"
4. Click en "Crear mandato"
5. Completar formulario:
   - Plazo: "60 días"
   - Monto: 500000
   - Observaciones: "Prueba de mandato"
6. Enviar formulario
   - ✅ Debe crear el mandato exitosamente
   - ✅ Debe redirigir a detalle del expediente
   - ✅ Sección mandato debe mostrar:
     - Plazo: 60 días
     - Monto: $500.000 ARS
     - Creado el: DD/MM/AAAA HH:MM
     - Vencimiento: DD/MM/AAAA (60 días después)
     - Observaciones: "Prueba de mandato"

### Test 7: Intentar Crear Mandato en Expediente NO Aprobado (403)

**Objetivo:** Verificar que solo expedientes APROBADOS permiten mandatos

1. Login como ASESOR (id: 10)
2. Ir a Expediente A (PENDIENTE, asesorId: 10)
3. En la sección "Mandato":
   - ✅ NO debe mostrar ningún contenido (ni mensaje ni botón)
4. Intentar POST manual a /mandatos con expedienteId de A
   - ✅ Debe responder 403 Forbidden
   - ✅ Error: "Solo se pueden crear mandatos para expedientes aprobados"

### Test 8: Intentar Crear Mandato en Expediente de Otro ASESOR (403)

**Objetivo:** Verificar que ASESOR solo puede crear mandatos en sus expedientes

1. Login como ASESOR (id: 10)
2. Intentar POST a /mandatos con expedienteId de C (asesorId: 11)
   - ✅ Debe responder 403 Forbidden
   - ✅ Error: "No tienes permiso para crear un mandato en este expediente"

### Test 9: Intentar Crear Mandato como ADMIN (403)

**Objetivo:** Verificar que solo ASESOR puede crear mandatos

1. Login como ADMIN
2. Ir a un expediente APROBADO
3. En sección Mandato:
   - ✅ Si no tiene mandato, NO debe mostrar botón "Crear mandato"
   - ✅ Solo debe mostrar el mandato si existe
4. Intentar POST manual a /mandatos
   - ✅ Debe responder 403 Forbidden
   - ✅ Error: "Solo los asesores pueden crear mandatos"

### Test 10: Intentar Crear Mandato Duplicado (400)

**Objetivo:** Verificar que un expediente solo puede tener un mandato

1. Login como ASESOR (id: 11)
2. Intentar POST a /mandatos con expedienteId de C (ya tiene mandato)
   - ✅ Debe responder 400 Bad Request
   - ✅ Error: "Este expediente ya tiene un mandato asociado"

### Test 11: Formateo de Montos

**Objetivo:** Verificar formato argentino de moneda

1. Ver expedientes con mandatos de diferentes montos:
   - 50000 → ✅ "$50.000 ARS"
   - 1500000 → ✅ "$1.500.000 ARS"
   - 250750 → ✅ "$250.750 ARS"

### Test 12: Formateo de Fechas

**Objetivo:** Verificar formato argentino de fechas

1. Ver expedientes y mandatos:
   - Fecha creación: ✅ "12/11/2025"
   - Fecha con hora: ✅ "12/11/2025 14:30"
   - Vencimiento calculado: ✅ fecha base + días del plazo

### Test 13: Responsive Design

**Objetivo:** Verificar diseño en mobile

1. Abrir DevTools y cambiar a vista mobile (375px)
2. Ver lista de expedientes:
   - ✅ Grid debe cambiar a 1 columna
   - ✅ Header debe apilar elementos verticalmente
   - ✅ Toggle debe verse completo
3. Ver detalle de expediente:
   - ✅ Mandato grid debe cambiar a 1 columna
   - ✅ Todos los campos deben ser legibles

---

## ⚠️ Notas de Seguridad

### Seguridad Server-Side (Crítico)

1. **NUNCA confiar solo en el frontend:** El toggle "Mis expedientes" es UI/UX, pero el backend SIEMPRE filtra por asesorId cuando rol === 'ASESOR'

2. **Doble validación en POST /mandatos:**
   - Middleware: Solo rol ASESOR puede acceder
   - Controlador: Verifica estado APROBADO + propiedad del expediente

3. **Token JWT debe incluir rol:** Asegurar que el payload del JWT contenga \`rol\`

### Variables de Entorno

No commitear el \`.env\` al repositorio. Usar \`.env.example\`:

\`\`\`env
# .env.example
JWT_SECRET=cambiar_en_produccion
JWT_EXPIRES_IN=24h
VITE_API_URL=http://localhost:3000
\`\`\`

---

## 🐛 Troubleshooting

### Error: "Cannot find module '../utils/format'"

**Solución:** Verificar que existe el archivo \`src/utils/format.ts\`

### Error: "rol is undefined" en backend

**Solución:** Verificar que el token JWT incluye el campo \`rol\` al hacer login

### Toggle no aparece para ASESOR

**Solución:** Verificar en \`ExpedientesList.tsx\`:
\`\`\`tsx
{user?.rol === 'ASESOR' && (
  <label className={styles.toggleContainer}>
    ...
  </label>
)}
\`\`\`

### Skeleton no se muestra

**Solución:** Verificar que los estilos CSS incluyen las clases:
- \`.skeletonWrapper\`
- \`.skeletonCard\`
- \`@keyframes shimmer\`

### ASESOR ve expedientes de otros asesores

**Solución crítica:** Verificar controlador backend:
\`\`\`javascript
if (user.rol === 'ASESOR') {
  where.asesorId = user.id;  // ← DEBE estar
}
\`\`\`

### Error 403 al crear mandato válido

**Solución:** Verificar en orden:
1. ¿El usuario es ASESOR? (\`user.rol === 'ASESOR'\`)
2. ¿El expediente está APROBADO? (\`expediente.estado === 'APROBADO'\`)
3. ¿El expediente pertenece al asesor? (\`expediente.asesorId === user.id'\`)
4. ¿El expediente NO tiene mandato previo? (\`!expediente.mandato\`)

---

## 📊 Checklist de Implementación

### Frontend

- [x] Crear \`src/utils/format.ts\`
- [x] Actualizar \`ExpedientesList.tsx\` (toggle, badges, skeleton)
- [x] Actualizar \`ExpedientesList.module.css\` (estilos nuevos)
- [x] Actualizar \`ExpedienteDetail.tsx\` (sección mandato mejorada)
- [x] Actualizar \`ExpedienteDetail.module.css\` (estilos mandato)

### Backend

- [ ] Copiar \`rbac.middleware.js\` a \`backend/middleware/\`
- [ ] Actualizar controlador de expedientes con filtrado por rol
- [ ] Actualizar controlador de mandatos con validaciones
- [ ] Configurar rutas con \`authenticateToken\` y \`requireRole\`
- [ ] Verificar que JWT incluye \`rol\` en payload
- [ ] Agregar \`JWT_SECRET\` a \`.env\`

### Testing

- [ ] Test 1: Badges de rol (ADMIN verde, REVISOR azul, ASESOR gris)
- [ ] Test 2: Toggle "Mis expedientes" para ASESOR
- [ ] Test 3: Skeleton loading
- [ ] Test 4: Cards con resumen de mandato
- [ ] Test 5: Crear mandato (happy path)
- [ ] Test 6: Error 403 - expediente no aprobado
- [ ] Test 7: Error 403 - expediente de otro asesor
- [ ] Test 8: Error 403 - ADMIN intenta crear mandato
- [ ] Test 9: Error 400 - mandato duplicado
- [ ] Test 10: Formateo de montos y fechas
- [ ] Test 11: Responsive design

---

## 📞 Soporte

Si encuentras algún problema durante la implementación:

1. Revisar los archivos en \`backend-examples/\`
2. Verificar que todas las dependencias están instaladas
3. Comprobar que el JWT incluye el campo \`rol\`
4. Revisar logs del backend para errores específicos

---

**Fecha de implementación:** Noviembre 2025  
**Versión:** 1.0.0
