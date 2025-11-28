import 'dotenv/config';
import app from './app';

// SEGURIDAD: Validar variables de entorno críticas al inicio
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ FATAL: Variables de entorno faltantes:', missingVars.join(', '));
  console.error('Por favor configure las variables en el archivo .env');
  process.exit(1);
}

console.log('✅ Variables de entorno validadas correctamente');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 Modo: ${process.env.NODE_ENV || 'development'}`);
});
