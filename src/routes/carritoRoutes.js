/**
 * Rutas para la gestión del carrito de compras
 * Todas las rutas requieren autenticación
 */

import { Router } from 'express';
import { CarritoController } from '../controllers/CarritoController.js';
import { verificarToken } from '../middlewares/auth/tokenMiddleware.js';

const router = Router();

/**
 * @route   GET /api/carrito
 * @desc    Obtiene el carrito completo del usuario autenticado
 * @access  Private
 */
router.get('/', 
  verificarToken,
  CarritoController.obtenerCarrito
);

/**
 * @route   GET /api/carrito/resumen
 * @desc    Obtiene solo el resumen del carrito (cantidad y total)
 * @access  Private
 */
router.get('/resumen', 
  verificarToken,
  CarritoController.obtenerResumen
);

/**
 * @route   POST /api/carrito/agregar
 * @desc    Agrega un producto al carrito
 * @access  Private
 */
router.post('/agregar', 
  verificarToken,
  CarritoController.agregarProducto
);

/**
 * @route   PUT /api/carrito/producto/:id_producto
 * @desc    Actualiza la cantidad de un producto en el carrito
 * @access  Private
 */
router.put('/producto/:id_producto', 
  verificarToken,
  CarritoController.actualizarCantidad
);

/**
 * @route   DELETE /api/carrito/producto/:id_producto
 * @desc    Elimina un producto específico del carrito
 * @access  Private
 */
router.delete('/producto/:id_producto', 
  verificarToken,
  CarritoController.eliminarProducto
);

/**
 * @route   DELETE /api/carrito/vaciar
 * @desc    Vacía completamente el carrito del usuario
 * @access  Private
 */
router.delete('/vaciar', 
  verificarToken,
  CarritoController.vaciarCarrito
);

export { router as carritoRoutes };
