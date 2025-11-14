import { Router } from 'express';
import { login } from '../controllers/auth.controller';

const router = Router();

/**
 * POST /auth/login
 * Autenticar usuario y obtener JWT
 * Body: { email, password }
 */
router.post('/login', login);

export default router;
