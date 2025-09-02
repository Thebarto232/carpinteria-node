/**
 * Rutas para la gestión de facturas
 * Define los endpoints para gestionar facturas
 */

import express from 'express';
import { FacturaController } from '../controllers/FacturaController.js';
import { verificarToken } from '../middlewares/auth/tokenMiddleware.js';
import { requierePermiso } from '../middlewares/auth/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

/**
 * @route GET /api/facturas
 * @desc Obtiene todas las facturas (solo administradores)
 * @access Privado (permisos de lectura de facturas)
 */
router.get('/', requierePermiso('leer_facturas'), FacturaController.obtenerTodasLasFacturas);

/**
 * @route GET /api/facturas/mis-facturas
 * @desc Obtiene las facturas del usuario
 * @access Privado (usuarios autenticados)
 */
router.get('/mis-facturas', FacturaController.obtenerMisFacturas);

/**
 * @route GET /api/facturas/:id
 * @desc Obtiene una factura por ID
 * @access Privado (propietario o admin)
 */
router.get('/:id', requierePermiso('leer_facturas'), FacturaController.obtenerFactura);

/**
 * @route GET /api/facturas/numero/:numero
 * @desc Busca una factura por número
 * @access Privado (propietario o admin)
 */
router.get('/numero/:numero', FacturaController.buscarPorNumero);

/**
 * @route GET /api/facturas/:id/pdf
 * @desc Descarga una factura en PDF
 * @access Privado (propietario o admin)
 */
router.get('/:id/pdf', FacturaController.descargarFacturaPDF);

// Rutas administrativas
/**
 * @route POST /api/facturas/generar
 * @desc Genera una factura para una venta
 * @access Privado (permisos de creación de facturas)
 */
router.post('/generar', requierePermiso('crear_facturas'), FacturaController.generarFactura);

/**
 * @route PUT /api/facturas/:id/marcar-pagada
 * @desc Marca una factura como pagada
 * @access Privado (permisos de edición de facturas)
 */
router.put('/:id/marcar-pagada', requierePermiso('editar_facturas'), FacturaController.marcarComoPagada);

/**
 * @route PUT /api/facturas/:id/anular
 * @desc Anula una factura
 * @access Privado (permisos de edición de facturas)
 */
router.put('/:id/anular', requierePermiso('editar_facturas'), FacturaController.anularFactura);

/**
 * @route DELETE /api/facturas/:id
 * @desc Elimina una factura
 * @access Privado (permisos de eliminación de facturas)
 */
router.delete('/:id', requierePermiso('eliminar_facturas'), FacturaController.eliminarFactura);

/**
 * @route GET /api/facturas/estadisticas/resumen
 * @desc Obtiene estadísticas de facturación
 * @access Privado (permisos de lectura de facturas)
 */
router.get('/estadisticas/resumen', requierePermiso('leer_facturas'), FacturaController.obtenerEstadisticas);

export default router;
