/**
 * Rutas para la gestión de ventas
 * Define los endpoints para procesar compras y gestionar ventas
 */

import express from 'express';
import { VentaController } from '../controllers/VentaController.js';
import { verificarToken } from '../middlewares/auth/tokenMiddleware.js';
import { requierePermiso } from '../middlewares/auth/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

/**
 * @route POST /api/ventas/procesar-compra
 * @desc Procesa una compra desde el carrito del usuario
 * @access Privado (usuarios autenticados)
 */
router.post('/procesar-compra', VentaController.procesarCompra);

/**
 * @route GET /api/ventas/mis-compras
 * @desc Obtiene el historial de compras del usuario
 * @access Privado (usuarios autenticados)
 */
router.get('/mis-compras', VentaController.obtenerMisCompras);

/**
 * @route GET /api/ventas/:id
 * @desc Obtiene los detalles de una compra específica
 * @access Privado (propietario o admin)
 */
router.get('/:id', VentaController.obtenerDetalleCompra);

/**
 * @route DELETE /api/ventas/:id/cancelar
 * @desc Cancela una compra
 * @access Privado (propietario)
 */
router.delete('/:id/cancelar', VentaController.cancelarCompra);

// Rutas administrativas
/**
 * @route GET /api/ventas
 * @desc Obtiene todas las ventas (solo administradores)
 * @access Privado (permisos de lectura de ventas)
 */
router.get('/', requierePermiso('leer_ventas'), VentaController.obtenerTodasLasVentas);

/**
 * @route GET /api/ventas/estadisticas/resumen
 * @desc Obtiene estadísticas de ventas
 * @access Privado (permisos de lectura de ventas)
 */
router.get('/estadisticas/resumen', requierePermiso('leer_ventas'), VentaController.obtenerEstadisticas);

export default router;
