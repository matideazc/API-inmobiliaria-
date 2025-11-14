import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

/**
 * POST /auth/login
 * Valida credenciales y devuelve un JWT
 */
export const login = async (req: Request, res: Response) => {
try {
    const { email, password } = req.body;

    // Validar que vengan los datos
    if (!email || !password) {
    res.status(400).json({ 
        error: 'Email y password son requeridos' 
    });
    return;
    }

    // Buscar el usuario por email
    const usuario = await prisma.usuario.findUnique({
    where: { email }
    });

    if (!usuario) {
    res.status(401).json({ 
        error: 'Credenciales inválidas' 
    });
    return;
    }

    // Verificar el password con bcrypt
    const passwordValido = await bcrypt.compare(password, usuario.hash);

    if (!passwordValido) {
    res.status(401).json({ 
        error: 'Credenciales inválidas' 
    });
    return;
    }

    // Generar JWT
    const JWT_SECRET = process.env.JWT_SECRET;
    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

    if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no configurado en .env');
    }

    const token = jwt.sign(
    {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    res.json({
    mensaje: 'Login exitoso',
    token,
    usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
    }
    });
} catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
    error: 'Error interno del servidor' 
    });
}
};
