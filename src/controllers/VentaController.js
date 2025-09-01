/**
 * Controlador para la gestión de ventas
 * Maneja las operaciones relacionadas con ventas y compras
 */

import { Venta } from '../models/Venta.js';
import { Factura } from '../models/Factura.js';
import { ResponseProvider } from '../providers/ResponseProvider.js';

export class VentaController {
    /**
     * Procesa una compra desde el carrito
     */
    static async procesarCompra(req, res) {
        try {
            const idUsuario = req.usuario.id_usuario;

            // Procesar la venta
            const venta = await Venta.procesarVentaDesdeCarrito(idUsuario);

            // Generar factura automáticamente
            const factura = await Factura.generarFactura(venta.id_venta);

            return ResponseProvider.success(res, {
                message: 'Compra procesada exitosamente',
                venta,
                factura
            });

        } catch (error) {
            console.error('Error procesando compra:', error);
            return ResponseProvider.error(res, error.message, 400);
        }
    }

    /**
     * Obtiene el historial de compras del usuario
     */
    static async obtenerMisCompras(req, res) {
        try {
            const idUsuario = req.usuario.id_usuario;
            const limite = parseInt(req.query.limite) || 10;
            const pagina = parseInt(req.query.pagina) || 1;
            const offset = (pagina - 1) * limite;

            console.log(`Obteniendo compras para usuario ${idUsuario}, límite: ${limite}, offset: ${offset}`);

            const ventas = await Venta.obtenerVentasPorUsuario(idUsuario, limite, offset);

            return ResponseProvider.success(res, {
                ventas,
                paginacion: {
                    pagina,
                    limite,
                    total: ventas.length
                }
            });

        } catch (error) {
            console.error('Error obteniendo compras:', error);
            return ResponseProvider.error(res, `Error al obtener el historial de compras: ${error.message}`, 500);
        }
    }

    /**
     * Obtiene los detalles de una compra específica
     */
    static async obtenerDetalleCompra(req, res) {
        try {
            const { id } = req.params;
            const idUsuario = req.usuario.id_usuario;

            const venta = await Venta.obtenerVentaPorId(id);

            // Verificar que la venta pertenece al usuario (excepto si es admin)
            if (venta.id_usuario !== idUsuario && !req.usuario.permisos?.includes('leer_ventas')) {
                return ResponseProvider.noAutorizado(res, 'No tienes permisos para ver esta venta');
            }

            return ResponseProvider.success(res, { venta });

        } catch (error) {
            console.error('Error obteniendo detalle de compra:', error);
            return ResponseProvider.error(res, error.message, 404);
        }
    }

    /**
     * Cancela una compra (si es posible)
     */
    static async cancelarCompra(req, res) {
        try {
            const { id } = req.params;
            const idUsuario = req.usuario.id_usuario;

            await Venta.cancelarVenta(id, idUsuario);

            return ResponseProvider.success(res, {
                message: 'Compra cancelada exitosamente'
            });

        } catch (error) {
            console.error('Error cancelando compra:', error);
            return ResponseProvider.error(res, error.message, 400);
        }
    }

    /**
     * Obtiene todas las ventas (solo administradores)
     */
    static async obtenerTodasLasVentas(req, res) {
        try {
            const limite = parseInt(req.query.limite) || 50;
            const pagina = parseInt(req.query.pagina) || 1;
            const offset = (pagina - 1) * limite;

            // Aquí deberías implementar una consulta más completa para administradores
            // Por ahora usamos una consulta básica
            const ventas = await Venta.obtenerVentasPorUsuario(null, limite, offset);

            return ResponseProvider.success(res, {
                ventas,
                paginacion: {
                    pagina,
                    limite
                }
            });

        } catch (error) {
            console.error('Error obteniendo todas las ventas:', error);
            return ResponseProvider.error(res, 'Error al obtener las ventas');
        }
    }

    /**
     * Obtiene estadísticas de ventas
     */
    static async obtenerEstadisticas(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.query;

            const estadisticas = await Venta.obtenerEstadisticasVentas(fechaInicio, fechaFin);
            const productosMasVendidos = await Venta.obtenerProductosMasVendidos(10);

            return ResponseProvider.success(res, {
                estadisticas,
                productosMasVendidos
            });

        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return ResponseProvider.error(res, 'Error al obtener estadísticas');
        }
    }
}
