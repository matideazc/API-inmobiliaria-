import 'dotenv/config';
import app from './app';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0', () => {
console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
console.log(`🌱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
