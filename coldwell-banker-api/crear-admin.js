// Script para crear usuario admin
// Ejecutar con: node crear-admin.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function crearAdmin() {
  try {
    // Verificar si el usuario ya existe
    const existente = await prisma.usuario.findUnique({
      where: { email: 'admin@coldwellbanker.com.ar' }
    });

    if (existente) {
      console.log('✅ El usuario admin@coldwellbanker.com.ar ya existe');
      console.log('   ID:', existente.id);
      console.log('   Nombre:', existente.nombre);
      console.log('   Rol:', existente.rol);
      return;
    }

    // Generar hash de la password
    console.log('🔐 Generando hash de password...');
    const hash = await bcrypt.hash('admin123', 10);

    // Crear el usuario
    console.log('👤 Creando usuario admin...');
    const nuevoAdmin = await prisma.usuario.create({
      data: {
        nombre: 'Admin',
        email: 'admin@coldwellbanker.com.ar',
        hash: hash,
        rol: 'ADMIN'
      }
    });

    console.log('✅ Usuario admin creado exitosamente!');
    console.log('   ID:', nuevoAdmin.id);
    console.log('   Email:', nuevoAdmin.email);
    console.log('   Rol:', nuevoAdmin.rol);
    console.log('\n📝 Credenciales:');
    console.log('   Email: admin@coldwellbanker.com.ar');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Error al crear usuario admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

crearAdmin();
