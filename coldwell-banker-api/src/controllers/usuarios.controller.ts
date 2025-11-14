import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma';

/**
 * POST /usuarios
 * Crea un nuevo usuario con password hasheado
 */
export const crearUsuario = async (req: Request, res: Response) => {
try {
    const { nombre, email, password, rol } = req.body;

    // Validar que vengan los datos requeridos
    if (!nombre || !email || !password) {
    res.status(400).json({ 
        error: 'Faltan campos requeridos: nombre, email, password' 
    });
    return;
    }

    // Verificar que el email no exista
    const usuarioExistente = await prisma.usuario.findUnique({
    where: { email }
    });

    if (usuarioExistente) {
    res.status(409).json({ 
        error: 'El email ya está registrado' 
    });
    return;
    }

    // Hashear el password con bcrypt (10 rounds)
    const hash = await bcrypt.hash(password, 10);

    // Crear el usuario en la base de datos
    const nuevoUsuario = await prisma.usuario.create({
    data: {
        nombre,
        email,
        hash,
        rol: rol || 'ASESOR' // Por defecto ASESOR si no se especifica
    },
    select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        createdAt: true
        // NO devolvemos el hash
    }
    });

    res.status(201).json({
    mensaje: 'Usuario creado exitosamente',
    usuario: nuevoUsuario
    });
} catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ 
    error: 'Error interno del servidor' 
    });
}
};
