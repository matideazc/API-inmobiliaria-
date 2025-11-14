import { Router } from 'express';
import { crearUsuario } from '../controllers/usuarios.controller';

const router = Router();

/**
 * POST /usuarios
 * Crear un nuevo usuario
 * Body: { nombre, email, password, rol? }
 */
router.post('/', crearUsuario);

export default router;
