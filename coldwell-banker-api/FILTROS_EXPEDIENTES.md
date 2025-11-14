# 🔍 Filtros y Paginación - Expedientes

## 📋 Endpoint mejorado

**GET** `/expedientes`

Ahora soporta filtros avanzados y paginación.

---

## 🎯 Query Parameters

### **Paginación:**

- `page` (opcional, default: 1): Número de página
- `limit` (opcional, default: 10, max: 100): Registros por página

### **Filtros:**

- `estado` (opcional): PENDIENTE | APROBADO | RECHAZADO
- `asesorId` (opcional): ID del asesor/usuario que creó el expediente
- `desde` (opcional): Fecha desde (formato ISO: YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss.sssZ)
- `hasta` (opcional): Fecha hasta (formato ISO)
- `q` (opcional): Texto para buscar en título o nombre del propietario (case-insensitive)

---

## 📊 Estructura de Respuesta

```json
{
  "data": [...],           // Array de expedientes
  "pagination": {
    "total": 45,           // Total de registros que cumplen el filtro
    "page": 1,             // Página actual
    "limit": 10,           // Registros por página
    "totalPages": 5        // Total de páginas
  },
  "filters": {             // Filtros aplicados
    "estado": "PENDIENTE",
    "asesorId": 1,
    "desde": "2025-01-01",
    "hasta": null,
    "q": null
  }
}
```

---

## 🧪 Ejemplos con PowerShell

### Paso 1: Login y obtener token

```powershell
$loginBody = @{
    email = "juan@coldwell.com"
    password = "miPassword123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token

$headers = @{
    Authorization = "Bearer $token"
}
```

---

### 1️⃣ **Sin filtros (primera página, 10 registros)**

```powershell
$resultado = Invoke-RestMethod -Uri "http://localhost:3000/expedientes" -Headers $headers
Write-Host "Total de expedientes: $($resultado.pagination.total)"
Write-Host "Página: $($resultado.pagination.page) de $($resultado.pagination.totalPages)"
$resultado.data | Format-Table -Property id, titulo, estado, propietarioNombre
```

---

### 2️⃣ **Con paginación personalizada**

```powershell
# Página 2, 20 registros por página
$resultado = Invoke-RestMethod -Uri "http://localhost:3000/expedientes?page=2&limit=20" -Headers $headers
Write-Host "Mostrando página 2 con 20 registros"
$resultado.data | Format-Table -Property id, titulo, estado
```

---

### 3️⃣ **Filtrar por estado**

```powershell
# Solo expedientes APROBADOS
$resultado = Invoke-RestMethod -Uri "http://localhost:3000/expedientes?estado=APROBADO" -Headers $headers
Write-Host "Expedientes APROBADOS: $($resultado.pagination.total)"
$resultado.data | Format-Table -Property id, titulo, propietarioNombre
```

---

### 4️⃣ **Filtrar por asesor**

```powershell
# Solo expedientes del asesor con ID 1
$asesorId = 1
$resultado = Invoke-RestMethod -Uri "http://localhost:3000/expedientes?asesorId=$asesorId" -Headers $headers
Write-Host "Expedientes del asesor $asesorId : $($resultado.pagination.total)"
$resultado.data | Format-Table -Property id, titulo, estado
```

---

### 5️⃣ **Filtrar por rango de fechas**

```powershell
# Expedientes creados desde el 1 de noviembre de 2025
$desde = "2025-11-01"
$resultado = Invoke-RestMethod -Uri "http://localhost:3000/expedientes?desde=$desde" -Headers $headers
Write-Host "Expedientes desde $desde : $($resultado.pagination.total)"
$resultado.data | Format-Table -Property id, titulo, createdAt

# Expedientes entre dos fechas
$desde = "2025-11-01"
$hasta = "2025-11-09"
$url = "http://localhost:3000/expedientes?desde=$desde&hasta=$hasta"
$resultado = Invoke-RestMethod -Uri $url -Headers $headers
Write-Host "Expedientes entre $desde y $hasta : $($resultado.pagination.total)"
```

---

### 6️⃣ **Búsqueda por texto**

```powershell
# Buscar "casa" en título o nombre del propietario
$busqueda = "casa"
$resultado = Invoke-RestMethod -Uri "http://localhost:3000/expedientes?q=$busqueda" -Headers $headers
Write-Host "Resultados para '$busqueda': $($resultado.pagination.total)"
$resultado.data | Format-Table -Property id, titulo, propietarioNombre
```

---

### 7️⃣ **Combinar múltiples filtros**

```powershell
# Expedientes PENDIENTES del asesor 1, creados desde nov 2025, con "casa" en el título
$params = @{
    estado = "PENDIENTE"
    asesorId = 1
    desde = "2025-11-01"
    q = "casa"
    page = 1
    limit = 5
}

$queryString = ($params.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&"
$url = "http://localhost:3000/expedientes?$queryString"

$resultado = Invoke-RestMethod -Uri $url -Headers $headers
Write-Host "Filtros combinados - Total: $($resultado.pagination.total)"
Write-Host "Filtros aplicados:"
$resultado.filters | Format-List
Write-Host "`nResultados:"
$resultado.data | Format-Table -Property id, titulo, estado, propietarioNombre
```

---

### 8️⃣ **Iterar por todas las páginas**

```powershell
# Obtener TODOS los expedientes iterando por páginas
$page = 1
$limit = 10
$todosLosExpedientes = @()

do {
    $resultado = Invoke-RestMethod -Uri "http://localhost:3000/expedientes?page=$page&limit=$limit" -Headers $headers
    $todosLosExpedientes += $resultado.data
    Write-Host "Página $page de $($resultado.pagination.totalPages) - Expedientes acumulados: $($todosLosExpedientes.Count)"
    $page++
} while ($page -le $resultado.pagination.totalPages)

Write-Host "`nTotal de expedientes obtenidos: $($todosLosExpedientes.Count)"
$todosLosExpedientes | Format-Table -Property id, titulo, estado
```

---

## ❌ Validaciones y Errores

### **Error 400: Estado inválido**

```powershell
# Intentar con estado que no existe
try {
    $resultado = Invoke-RestMethod -Uri "http://localhost:3000/expedientes?estado=INVALIDO" -Headers $headers
} catch {
    $error = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Error: $($error.error)"
    # Output: "Estado inválido. Estados permitidos: PENDIENTE, APROBADO, RECHAZADO"
}
```

### **Error 400: AsesorId inválido**

```powershell
# Intentar con asesorId no numérico
try {
    $resultado = Invoke-RestMethod -Uri "http://localhost:3000/expedientes?asesorId=abc" -Headers $headers
} catch {
    $error = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Error: $($error.error)"
    # Output: "El parámetro 'asesorId' debe ser un número válido"
}
```

### **Error 400: Fecha inválida**

```powershell
# Intentar con fecha mal formateada
try {
    $resultado = Invoke-RestMethod -Uri "http://localhost:3000/expedientes?desde=fecha-invalida" -Headers $headers
} catch {
    $error = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Error: $($error.error)"
    # Output: "El parámetro 'desde' debe ser una fecha válida en formato ISO"
}
```

### **Error 400: Page o Limit inválidos**

```powershell
# Page menor a 1
try {
    $resultado = Invoke-RestMethod -Uri "http://localhost:3000/expedientes?page=0" -Headers $headers
} catch {
    $error = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Error: $($error.error)"
    # Output: "El parámetro 'page' debe ser un número mayor a 0"
}

# Limit mayor a 100
try {
    $resultado = Invoke-RestMethod -Uri "http://localhost:3000/expedientes?limit=200" -Headers $headers
} catch {
    $error = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Error: $($error.error)"
    # Output: "El parámetro 'limit' debe ser un número entre 1 y 100"
}
```

---

## 📊 Casos de Uso Prácticos

### **Dashboard de asesor: Ver mis expedientes pendientes**

```powershell
# El asesor ve solo sus expedientes pendientes
$miId = $loginResponse.usuario.id
$resultado = Invoke-RestMethod -Uri "http://localhost:3000/expedientes?asesorId=$miId&estado=PENDIENTE" -Headers $headers
Write-Host "Tengo $($resultado.pagination.total) expedientes pendientes"
```

### **Reporte mensual: Expedientes aprobados en noviembre**

```powershell
$desde = "2025-11-01"
$hasta = "2025-11-30"
$resultado = Invoke-RestMethod -Uri "http://localhost:3000/expedientes?estado=APROBADO&desde=$desde&hasta=$hasta" -Headers $headers
Write-Host "Expedientes aprobados en noviembre: $($resultado.pagination.total)"
```

### **Buscar expediente de un cliente específico**

```powershell
$nombreCliente = "González"
$resultado = Invoke-RestMethod -Uri "http://localhost:3000/expedientes?q=$nombreCliente" -Headers $headers
Write-Host "Expedientes de clientes con '$nombreCliente': $($resultado.pagination.total)"
$resultado.data | Format-Table -Property id, titulo, propietarioNombre, estado
```

---

## 🔒 Validaciones Implementadas

✅ **page**: Debe ser número >= 1  
✅ **limit**: Debe ser número entre 1 y 100  
✅ **estado**: Solo PENDIENTE, APROBADO, RECHAZADO  
✅ **asesorId**: Debe ser número válido  
✅ **desde/hasta**: Deben ser fechas válidas en formato ISO  
✅ **q**: Búsqueda case-insensitive en título y propietario  

---

## 📝 Notas Técnicas

- **Búsqueda de texto**: Es case-insensitive (no distingue mayúsculas/minúsculas)
- **Ordenamiento**: Siempre por `createdAt` descendente (más recientes primero)
- **Límite máximo**: 100 registros por página para prevenir sobrecarga
- **Paginación**: Si no hay resultados, devuelve array vacío con total = 0
- **Filtros nulos**: Si no se especifica un filtro, no se aplica (se ignora)

---

## 📈 Ejemplo de Respuesta Completa

```json
{
  "data": [
    {
      "id": 5,
      "titulo": "Casa Centro 456",
      "descripcion": "Propiedad en zona céntrica",
      "propietarioNombre": "María González",
      "asesorId": 1,
      "estado": "PENDIENTE",
      "comentariosRevisor": null,
      "createdAt": "2025-11-09T14:30:00.000Z",
      "updatedAt": "2025-11-09T14:30:00.000Z",
      "asesor": {
        "id": 1,
        "nombre": "Juan Pérez",
        "email": "juan@coldwell.com",
        "rol": "ASESOR"
      }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "filters": {
    "estado": "PENDIENTE",
    "asesorId": 1,
    "desde": null,
    "hasta": null,
    "q": null
  }
}
```

---

## ✅ Resumen de Mejoras

| Característica | Implementado |
|----------------|--------------|
| Paginación | ✅ page & limit |
| Filtro por estado | ✅ PENDIENTE/APROBADO/RECHAZADO |
| Filtro por asesor | ✅ asesorId |
| Filtro por fechas | ✅ desde & hasta |
| Búsqueda de texto | ✅ q (título/propietario) |
| Validaciones | ✅ Todas las validaciones |
| Respuesta estructurada | ✅ data, pagination, filters |
| Compatible con ruta anterior | ✅ Sin cambios en otras rutas |
