/**
 * Script para crear un usuario administrador de prueba
 * Ejecutar con: npx tsx scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔧 Creando usuario administrador...');

    // Email del admin
    const email = 'admin@coldwellbanker.com.ar';
    const password = 'admin123'; // Contraseña temporal

    // Verificar si ya existe
    const existing = await prisma.usuario.findUnique({
      where: { email }
    });

    if (existing) {
      console.log('⚠️  El usuario admin ya existe');
      console.log('Email:', email);
      return;
    }

    // Hash de contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const admin = await prisma.usuario.create({
      data: {
        nombre: 'Administrador',
        email,
        hash: passwordHash,  // El campo se llama 'hash' en el schema
        rol: 'ADMIN'
      }
    });

    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', email);
    console.log('🔑 Contraseña:', password);
    console.log('👤 Rol:', admin.rol);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  IMPORTANTE: Cambiar la contraseña en producción');

  } catch (error) {
    console.error('❌ Error al crear admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
