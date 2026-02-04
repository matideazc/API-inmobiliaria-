import { Router } from 'express';
import { crearUsuario, obtenerUsuarios, eliminarUsuario, cambiarPassword, obtenerPassword } from '../controllers/usuarios.controller';
import { autenticar, esAdmin } from '../middlewares/auth.middleware';

const router = Router();

/**
 * GET /usuarios
 * Obtener lista de todos los usuarios (solo ADMIN)
 */
router.get('/', autenticar, esAdmin, obtenerUsuarios);

/**
 * POST /usuarios
 * Crear un nuevo usuario (solo ADMIN)
 * Body: { nombre, email, password, rol? }
 */
router.post('/', autenticar, esAdmin, crearUsuario);

/**
 * GET /usuarios/:id/password
 * Obtener contraseña de un usuario (solo ADMIN)
 * IMPORTANTE: Esta ruta debe estar ANTES de PUT y DELETE
 */
router.get('/:id/password', autenticar, esAdmin, obtenerPassword);

/**
 * PUT /usuarios/:id/password
 * Cambiar contraseña de un usuario (solo ADMIN)
 * Body: { nuevaPassword }
 */
router.put('/:id/password', autenticar, esAdmin, cambiarPassword);

/**
 * DELETE /usuarios/:id
 * Eliminar un usuario por ID (solo ADMIN)
 */
router.delete('/:id', autenticar, esAdmin, eliminarUsuario);

export default router;
