# 🎨 UI Kit - Coldwell Banker CRM

Sistema de componentes reutilizables para el CRM inmobiliario.

## 📦 Componentes Base

### Button

Botón con variantes y tamaños predefinidos.

```tsx
import { Button } from '../ui';

// Variantes
<Button variant="primary">Primario</Button>
<Button variant="secondary">Secundario</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Peligro</Button>

// Tamaños
<Button size="sm">Pequeño</Button>
<Button size="md">Mediano</Button>
<Button size="lg">Grande</Button>

// Con props HTML nativas
<Button onClick={handleClick} disabled={loading}>
  Guardar
</Button>
```

**Props:**
- `variant?: 'primary' | 'secondary' | 'ghost' | 'danger'` (default: 'primary')
- `size?: 'sm' | 'md' | 'lg'` (default: 'md')
- `+ todas las props nativas de HTMLButtonElement`

---

### Input / Textarea

Inputs con estados y validación.

```tsx
import { Input, Textarea } from '../ui';
Z
// Input básico
<Input 
  placeholder="Email" 
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// Con label y error
<Input 
  label="Nombre completo"
  error={errors.nombre}
  value={nombre}
  onChange={(e) => setNombre(e.target.value)}
/>

// Con icono (ej: buscador)
<Input 
  placeholder="Buscar..."
  icon={<span>🔍</span>}
/>

// Textarea
<Textarea 
  label="Observaciones"
  rows={5}
  value={observaciones}
  onChange={(e) => setObservaciones(e.target.value)}
/>
```

**Props Input:**
- `label?: string`
- `error?: string`
- `icon?: ReactNode`
- `+ todas las props nativas de HTMLInputElement`

**Props Textarea:**
- `label?: string`
- `error?: string`
- `+ todas las props nativas de HTMLTextareaElement`

---

### Badge

Etiquetas para estados, roles, etc.

```tsx
import { Badge } from '../ui';

<Badge variant="success">APROBADO</Badge>
<Badge variant="warning">PENDIENTE</Badge>
<Badge variant="danger">RECHAZADO</Badge>
<Badge variant="info">ASESOR</Badge>
<Badge variant="default">General</Badge>
```

**Props:**
- `variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'` (default: 'default')

---

### Card

Contenedor con bordes, sombra y hover opcional.

```tsx
import { Card } from '../ui';

// Card básica
<Card>
  <h3>Título</h3>
  <p>Contenido</p>
</Card>

// Card clickeable con hover
<Card hover onClick={() => navigate(`/expedientes/${id}`)}>
  <h3>Expediente #{id}</h3>
  <p>Click para ver detalles</p>
</Card>
```

**Props:**
- `hover?: boolean` (default: false)
- `className?: string`
- `+ todas las props nativas de HTMLDivElement`

---

## 🏗️ Componentes de Layout

### AppShell

Wrapper principal con sidebar, topbar y breadcrumbs.

```tsx
import { AppShell } from '../layout';

// En App.tsx
<AppShell>
  <Routes>
    {/* tus rutas */}
  </Routes>
</AppShell>
```

**Características:**
- Sidebar colapsable
- Topbar con buscador, botón CTA, notificaciones y usuario
- Breadcrumbs automáticos basados en la ruta
- Oculta automáticamente en /login

---

### PageContainer

Wrapper para el contenido de cada página.

```tsx
import { PageContainer } from '../layout';

// Con título
<PageContainer title="Expedientes">
  {contenido}
</PageContainer>

// Con título y acciones
<PageContainer 
  title="Expedientes"
  actions={
    <>
      <Button onClick={handleExport}>Exportar</Button>
      <Button onClick={handleCreate}>+ Nuevo</Button>
    </>
  }
>
  {contenido}
</PageContainer>
```

**Props:**
- `title?: string`
- `actions?: ReactNode`
- `className?: string`

---

## 🎨 Tokens de Diseño

Todos los componentes usan variables CSS definidas en `index.css`.

### Colores

```css
/* Backgrounds */
--bg, --bg-elevated, --card, --muted

/* Text */
--text, --text-muted, --text-inverse

/* Primary */
--primary, --primary-foreground, --primary-hover

/* Semantic */
--success, --warning, --danger, --info

/* Borders */
--border, --ring
```

### Tipografía

```css
--text-xs    /* 12px */
--text-sm    /* 14px */
--text-base  /* 16px */
--text-lg    /* 18px */
--text-xl    /* 20px */
--text-2xl   /* 24px */
--text-3xl   /* 30px */
```

### Espaciado

```css
--space-xs   /* 4px */
--space-sm   /* 8px */
--space-md   /* 16px */
--space-lg   /* 24px */
--space-xl   /* 32px */
--space-2xl  /* 48px */
```

### Border Radius

```css
--radius-sm   /* 4px */
--radius-md   /* 8px */
--radius-lg   /* 12px */
--radius-full /* 9999px */
```

### Sombras

```css
--shadow-soft   /* Sombra suave */
--shadow-strong /* Sombra fuerte */
--shadow-glow   /* Glow azul */
```

---

## 📝 Ejemplo de Uso Completo

```tsx
import { PageContainer } from '../layout';
import { Card, Button, Badge, Input } from '../ui';

function ExpedientesPage() {
  return (
    <PageContainer
      title="Mis Expedientes"
      actions={
        <Button onClick={handleCreate}>+ Nuevo</Button>
      }
    >
      {/* Buscador */}
      <Input 
        placeholder="Buscar por título, propietario..."
        icon={<span>🔍</span>}
      />

      {/* Grid de cards */}
      <div className={styles.grid}>
        {expedientes.map(exp => (
          <Card key={exp.id} hover onClick={() => navigate(`/expedientes/${exp.id}`)}>
            <h3>{exp.titulo}</h3>
            <Badge variant={getVariant(exp.estado)}>
              {exp.estado}
            </Badge>
            <p>{exp.propietarioNombre}</p>
          </Card>
        ))}
      </div>

      {/* Paginación */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button variant="secondary" onClick={handlePrev}>
          ← Anterior
        </Button>
        <Button variant="secondary" onClick={handleNext}>
          Siguiente →
        </Button>
      </div>
    </PageContainer>
  );
}
```

---

## ✅ Buenas Prácticas

1. **Usa PageContainer** en todas las páginas para mantener consistencia
2. **Usa los componentes del UI kit** en lugar de `<button>`, `<input>` directos
3. **Respeta los tokens CSS** en lugar de valores hardcodeados
4. **No modifiques los estilos de los componentes base** - crea variantes si hace falta
5. **Mantén la lógica separada** - estos componentes son solo presentación

---

## 🚀 Próximos Pasos

Para migrar otras páginas al nuevo sistema:

1. Reemplazar contenedor propio por `<PageContainer>`
2. Reemplazar botones por `<Button>`
3. Reemplazar inputs por `<Input>` / `<Textarea>`
4. Reemplazar cards/divs con `<Card>`
5. Reemplazar badges por `<Badge>`
6. Usar tokens CSS en estilos custom
