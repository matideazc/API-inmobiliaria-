# 🔍 Auditoría de Código - Archivos No Utilizados

## 📊 Resumen Ejecutivo

**Fecha de auditoría**: 12/11/2025
**Total de archivos analizados**: 25
**Archivos NO utilizados**: 4
**Recomendación**: Eliminar 4 archivos

---

## ✅ ARCHIVOS UTILIZADOS (Mantener)

### 🎯 Core de la Aplicación
1. **src/main.tsx** ✅
   - Punto de entrada de la aplicación
   - Renderiza `<App />` con AuthProvider
   - **USADO**: Necesario para iniciar la app

2. **src/App.tsx** ✅
   - Router principal con todas las rutas
   - Importa: Login, ExpedientesList, ExpedienteDetail, UploadDocument, NewExpediente, MandatoForm, ProtectedRoute
   - **USADO**: Core de navegación

3. **src/index.css** ✅
   - Estilos globales con CSS variables (dark theme)
   - Variables: --bg-primary, --text-primary, --accent-blue, etc.
   - **USADO**: Estilos base de toda la app

---

### 🔐 Autenticación y Context
4. **src/context/AuthContext.tsx** ✅
   - Proveedor de autenticación global
   - Maneja: user, token, setAuth, clearAuth
   - **USADO**: Usado en Login, ProtectedRoute, y todos los componentes protegidos

5. **src/routes/ProtectedRoute.tsx** ✅
   - Wrapper para rutas protegidas
   - Redirige a /login si no hay token
   - **USADO**: Protege todas las rutas excepto /login

---

### 📄 Páginas (Pages)
6. **src/pages/Login.tsx** ✅
   - Página de login con formulario
   - Llama a POST /auth/login
   - **USADO**: Ruta /login

7. **src/pages/Login.module.css** ✅
   - Estilos del login
   - **USADO**: Por Login.tsx

8. **src/pages/ExpedientesList.tsx** ✅
   - Lista de expedientes con filtro por rol
   - ASESOR ve solo sus expedientes
   - **USADO**: Ruta /expedientes

9. **src/pages/ExpedientesList.module.css** ✅
   - Estilos de las cards, badges, paginación
   - **USADO**: Por ExpedientesList.tsx

10. **src/pages/ExpedienteDetail.tsx** ✅
    - Detalle de un expediente
    - Muestra mandato, documentos, botones de acción
    - **USADO**: Ruta /expedientes/:id

11. **src/pages/ExpedienteDetail.module.css** ✅
    - Estilos del detalle (incluye mandatoHeader, downloadPdfButton)
    - **USADO**: Por ExpedienteDetail.tsx

12. **src/pages/NewExpediente.tsx** ✅
    - Formulario para crear nuevo expediente
    - Campos: titulo, propietarioNombre, descripcion
    - **USADO**: Ruta /expedientes/nuevo

13. **src/pages/NewExpediente.module.css** ✅
    - Estilos del formulario de nuevo expediente
    - **USADO**: Por NewExpediente.tsx

14. **src/pages/MandatoForm.tsx** ✅
    - Formulario para crear mandato (solo ASESOR)
    - Campos: plazo, monto, observaciones
    - **USADO**: Ruta /expedientes/:id/mandato

15. **src/pages/MandatoForm.module.css** ✅
    - Estilos del formulario de mandato
    - **USADO**: Por MandatoForm.tsx

16. **src/pages/UploadDocument.tsx** ✅
    - Formulario para subir documentos a un expediente
    - **USADO**: Ruta /expedientes/:expedienteId/upload

17. **src/pages/UploadDocument.module.css** ✅
    - Estilos del formulario de upload
    - **USADO**: Por UploadDocument.tsx

---

### 🧩 Componentes
18. **src/components/ChangeStatusModal.tsx** ✅
    - Modal para cambiar estado de expediente (ADMIN/REVISOR)
    - Usado en ExpedienteDetail.tsx
    - **USADO**: Componente importado en ExpedienteDetail

19. **src/components/ChangeStatusModal.module.css** ✅
    - Estilos del modal
    - **USADO**: Por ChangeStatusModal.tsx

---

### 🔌 Services
20. **src/services/api.ts** ✅
    - Cliente axios con interceptores JWT
    - Función fetchExpedientes() con filtro por asesorId
    - **USADO**: Importado en ExpedientesList, ExpedienteDetail, etc.

---

## ❌ ARCHIVOS NO UTILIZADOS (Eliminar)

### 1. **src/App.css** ❌
- **Ubicación**: `src/App.css`
- **Contenido**: Estilos de template de Vite (logos, animaciones)
- **Problema**: NO está importado en ningún archivo
- **Búsqueda**: `grep "import './App.css'"` → 0 resultados
- **Recomendación**: **ELIMINAR**

### 2. **src/assets/react.svg** ❌
- **Ubicación**: `src/assets/react.svg`
- **Contenido**: Logo de React del template
- **Problema**: NO está importado ni usado en ningún componente
- **Búsqueda**: `grep "react.svg"` → 0 resultados
- **Recomendación**: **ELIMINAR**

### 3. **src/utils/format.ts** ❌
- **Ubicación**: `src/utils/format.ts`
- **Contenido**: Utilidades de formateo (formatCurrencyArs, formatDate, computeVencimiento, extractDays)
- **Problema**: NO está importado en ningún componente
- **Razón**: Los componentes usan formateo inline (ej: `toLocaleString('es-AR')`)
- **Búsqueda**: `grep "from '../utils/format'"` → 0 resultados
- **Nota**: Funciones útiles pero no utilizadas actualmente
- **Recomendación**: **ELIMINAR** (o integrar si quieres refactorizar)

### 4. **src/utils/format.examples.ts** ❌
- **Ubicación**: `src/utils/format.examples.ts`
- **Contenido**: Ejemplos de uso de las utilidades de format.ts
- **Problema**: Archivo de documentación/ejemplos, no código de producción
- **Recomendación**: **ELIMINAR**

### 5. **src/services/auth.ts** ❌
- **Ubicación**: `src/services/auth.ts`
- **Contenido**: Funciones decodeJWT, saveAuthData, getCurrentUser, clearAuthData
- **Problema**: NO está importado en ningún componente
- **Razón**: La lógica de auth está en AuthContext.tsx
- **Búsqueda**: `grep "from '../services/auth'"` → 0 resultados
- **Recomendación**: **ELIMINAR**

---

## 📋 Comandos para Eliminar Archivos No Utilizados

```bash
# Eliminar archivos NO utilizados
Remove-Item "src\App.css" -Force
Remove-Item "src\assets\react.svg" -Force
Remove-Item "src\utils\format.ts" -Force
Remove-Item "src\utils\format.examples.ts" -Force
Remove-Item "src\services\auth.ts" -Force

# Verificar que la carpeta assets está vacía y eliminarla
Remove-Item "src\assets" -Force -Recurse

# Verificar que la carpeta utils está vacía y eliminarla
Remove-Item "src\utils" -Force -Recurse
```

---

## 🎯 Estructura Final Recomendada

```
src/
├── components/
│   ├── ChangeStatusModal.tsx           ✅
│   └── ChangeStatusModal.module.css    ✅
├── context/
│   └── AuthContext.tsx                 ✅
├── pages/
│   ├── ExpedienteDetail.tsx            ✅
│   ├── ExpedienteDetail.module.css     ✅
│   ├── ExpedientesList.tsx             ✅
│   ├── ExpedientesList.module.css      ✅
│   ├── Login.tsx                       ✅
│   ├── Login.module.css                ✅
│   ├── MandatoForm.tsx                 ✅
│   ├── MandatoForm.module.css          ✅
│   ├── NewExpediente.tsx               ✅
│   ├── NewExpediente.module.css        ✅
│   ├── UploadDocument.tsx              ✅
│   └── UploadDocument.module.css       ✅
├── routes/
│   └── ProtectedRoute.tsx              ✅
├── services/
│   └── api.ts                          ✅
├── App.tsx                             ✅
├── index.css                           ✅
└── main.tsx                            ✅
```

---

## 📊 Estadísticas

| Categoría | Utilizados | No Utilizados | Total |
|-----------|-----------|---------------|-------|
| **Páginas** | 6 | 0 | 6 |
| **Componentes** | 1 | 0 | 1 |
| **Context** | 1 | 0 | 1 |
| **Services** | 1 | 1 | 2 |
| **Utils** | 0 | 2 | 2 |
| **Assets** | 0 | 1 | 1 |
| **CSS Globales** | 1 | 1 | 2 |
| **TOTAL** | **20** | **5** | **25** |

---

## ✅ Conclusión

El proyecto está **bien estructurado** pero tiene **5 archivos residuales** del template de Vite y código de ejemplos que nunca se implementó.

**Recomendación final**: Ejecutar los comandos de eliminación para mantener el proyecto limpio y sin código muerto.

**Impacto de eliminar**:
- ✅ Reduce tamaño del bundle (mínimo)
- ✅ Mejora claridad del proyecto
- ✅ Elimina confusión sobre qué código está activo
- ✅ No rompe ninguna funcionalidad (0 dependencias)
