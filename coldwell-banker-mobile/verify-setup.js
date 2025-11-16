#!/usr/bin/env node

/**
 * Script de verificación pre-ejecución
 * Verifica que todo esté configurado correctamente antes de iniciar la app
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verificando configuración de Coldwell Banker Mobile...\n');

let hasErrors = false;

// 1. Verificar que exista src/api/client.ts
const clientPath = path.join(__dirname, 'src', 'api', 'client.ts');
if (fs.existsSync(clientPath)) {
  const content = fs.readFileSync(clientPath, 'utf8');
  
  // Verificar si todavía tiene localhost
  if (content.includes('localhost:3000')) {
    console.log('⚠️  ADVERTENCIA: La URL del backend sigue en localhost:3000');
    console.log('   Edita src/api/client.ts y configura tu URL de backend\n');
  } else {
    console.log('✅ URL del backend configurada\n');
  }
} else {
  console.log('❌ ERROR: No se encuentra src/api/client.ts\n');
  hasErrors = true;
}

// 2. Verificar node_modules
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('✅ Dependencias instaladas\n');
} else {
  console.log('❌ ERROR: No se encuentran node_modules');
  console.log('   Ejecuta: npm install\n');
  hasErrors = true;
}

// 3. Verificar estructura de carpetas
const requiredDirs = [
  'src/api',
  'src/components',
  'src/contexts',
  'src/navigation',
  'src/screens',
  'src/theme',
  'src/types'
];

let allDirsExist = true;
requiredDirs.forEach(dir => {
  if (!fs.existsSync(path.join(__dirname, dir))) {
    console.log(`❌ Falta directorio: ${dir}`);
    allDirsExist = false;
    hasErrors = true;
  }
});

if (allDirsExist) {
  console.log('✅ Estructura de carpetas correcta\n');
}

// Resumen
console.log('─'.repeat(60));
if (!hasErrors) {
  console.log('\n✅ Todo listo para ejecutar la app!\n');
  console.log('Comandos disponibles:');
  console.log('  npm run android  - Ejecutar en Android');
  console.log('  npm run ios      - Ejecutar en iOS (solo macOS)');
  console.log('  npm run web      - Ejecutar en navegador');
  console.log('  npx expo start   - Iniciar servidor de desarrollo\n');
  console.log('📚 Lee README.md para más información\n');
} else {
  console.log('\n❌ Hay problemas que resolver antes de ejecutar\n');
  process.exit(1);
}
