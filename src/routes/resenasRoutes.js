import { Router } from 'express';
import * as resenaController from '../controllers/resenaController.js';
import { verificarToken } from '../middlewares/auth/tokenMiddleware.js';
import { requierePermiso } from '../middlewares/auth/authMiddleware.js';

const router = Router();

// Obtener reseñas de un producto (público)
router.get('/productos/:id/resenas', resenaController.getResenasByProducto);

// Crear reseña (requiere autenticación y permiso 'crear_reseñas')
router.post('/productos/:id/resenas', verificarToken, requierePermiso('crear_reseñas'), resenaController.createResena);

// Actualizar reseña (requiere autenticación y permiso 'actualizar_reseñas')
router.put('/resenas/:idResena', verificarToken, requierePermiso('actualizar_reseñas'), resenaController.updateResena);

// Eliminar reseña (requiere autenticación y permiso 'eliminar_reseñas')
router.delete('/resenas/:idResena', verificarToken, requierePermiso('eliminar_reseñas'), resenaController.deleteResena);

export default router;
