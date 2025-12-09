import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import { crearUsuario } from '../controllers/usuarios.controller';

const router = Router();

/**
 * POST /auth/login
 * Autenticar usuario y obtener JWT
 * Body: { email, password }
 */
router.post('/login', login);

/**
 * POST /auth/register
 * Registrar nuevo usuario
 * Body: { nombre, email, password, rol? }
 */
router.post('/register', crearUsuario);

export default router;
