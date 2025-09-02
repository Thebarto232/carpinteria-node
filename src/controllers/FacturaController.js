/**
 * Controlador para la gestión de facturas
 * Maneja las operaciones relacionadas con facturas
 */

import { Factura } from '../models/Factura.js';
import { ResponseProvider } from '../providers/ResponseProvider.js';
import { FacturaPDFService } from '../services/FacturaPDFService.js';

export class FacturaController {
    /**
     * Obtiene una factura por ID
     */
    static async obtenerFactura(req, res) {
        try {
            const { id } = req.params;
            const idUsuario = req.usuario.id_usuario;

            const factura = await Factura.obtenerFacturaPorId(id);

            return ResponseProvider.success(res, { factura });

        } catch (error) {
            console.error('Error obteniendo factura:', error);
            return ResponseProvider.error(res, error.message, 404);
        }
    }

    /**
     * Obtiene las facturas del usuario
     */
    static async obtenerMisFacturas(req, res) {
        try {
            const idUsuario = req.usuario.id_usuario;
            const limite = parseInt(req.query.limite) || 10;
            const pagina = parseInt(req.query.pagina) || 1;
            const offset = (pagina - 1) * limite;

            const facturas = await Factura.obtenerFacturasPorUsuario(idUsuario, limite, offset);

            return ResponseProvider.success(res, {
                facturas,
                paginacion: {
                    pagina,
                    limite,
                    total: facturas.length
                }
            });

        } catch (error) {
            console.error('Error obteniendo facturas:', error);
            return ResponseProvider.error(res, 'Error al obtener las facturas');
        }
    }

    /**
     * Obtiene todas las facturas (solo administradores)
     */
    static async obtenerTodasLasFacturas(req, res) {
        try {
            const limite = parseInt(req.query.limite) || 50;
            const pagina = parseInt(req.query.pagina) || 1;
            const offset = (pagina - 1) * limite;

            const facturas = await Factura.obtenerTodasLasFacturas(limite, offset);

            return ResponseProvider.success(res, {
                facturas,
                paginacion: {
                    pagina,
                    limite,
                    total: facturas.length
                }
            });

        } catch (error) {
            console.error('Error obteniendo todas las facturas:', error);
            return ResponseProvider.error(res, 'Error al obtener las facturas');
        }
    }

    /**
     * Busca una factura por número
     */
    static async buscarPorNumero(req, res) {
        try {
            const { numero } = req.params;
            const idUsuario = req.usuario.id_usuario;

            const factura = await Factura.buscarPorNumero(numero);

            if (!factura) {
                return ResponseProvider.error(res, 'Factura no encontrada', 404);
            }

            // Verificar permisos
            if (factura.id_usuario !== idUsuario && !req.usuario.permisos?.includes('leer_facturas')) {
                return ResponseProvider.noAutorizado(res, 'No tienes permisos para ver esta factura');
            }

            return ResponseProvider.success(res, { factura });

        } catch (error) {
            console.error('Error buscando factura:', error);
            return ResponseProvider.error(res, 'Error al buscar la factura');
        }
    }

    /**
     * Genera una factura para una venta (solo administradores)
     */
    static async generarFactura(req, res) {
        try {
            const { idVenta } = req.body;

            const factura = await Factura.generarFactura(idVenta);

            return ResponseProvider.success(res, {
                message: 'Factura generada exitosamente',
                factura
            });

        } catch (error) {
            console.error('Error generando factura:', error);
            return ResponseProvider.error(res, error.message, 400);
        }
    }

    /**
     * Marca una factura como pagada (solo administradores)
     */
    static async marcarComoPagada(req, res) {
        try {
            const { id } = req.params;

            const factura = await Factura.marcarComoPagada(id);

            return ResponseProvider.success(res, {
                message: 'Factura marcada como pagada',
                factura
            });

        } catch (error) {
            console.error('Error marcando factura como pagada:', error);
            return ResponseProvider.error(res, error.message, 400);
        }
    }

    /**
     * Anula una factura (solo administradores)
     */
    static async anularFactura(req, res) {
        try {
            const { id } = req.params;
            const { motivo } = req.body;

            const factura = await Factura.anularFactura(id, motivo);

            return ResponseProvider.success(res, {
                message: 'Factura anulada exitosamente',
                factura
            });

        } catch (error) {
            console.error('Error anulando factura:', error);
            return ResponseProvider.error(res, error.message, 400);
        }
    }

    /**
     * Elimina una factura (solo administradores)
     */
    static async eliminarFactura(req, res) {
        try {
            const { id } = req.params;

            await Factura.eliminarFactura(id);

            return ResponseProvider.success(res, {
                message: 'Factura eliminada exitosamente'
            });

        } catch (error) {
            console.error('Error eliminando factura:', error);
            return ResponseProvider.error(res, error.message, 400);
        }
    }

    /**
     * Obtiene estadísticas de facturación (solo administradores)
     */
    static async obtenerEstadisticas(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.query;

            const estadisticas = await Factura.obtenerEstadisticas(fechaInicio, fechaFin);

            return ResponseProvider.success(res, { estadisticas });

        } catch (error) {
            console.error('Error obteniendo estadísticas de facturación:', error);
            return ResponseProvider.error(res, 'Error al obtener estadísticas');
        }
    }

    /**
     * Genera y descarga un PDF de la factura
     */
    static async descargarFacturaPDF(req, res) {
        try {
            const { id } = req.params;
            const idUsuario = req.usuario.id_usuario;

            // Verificar que la factura existe y pertenece al usuario
            const factura = await Factura.obtenerFacturaPorId(id);
            
            if (!factura) {
                return ResponseProvider.error(res, 'Factura no encontrada', 404);
            }

            // Generar el PDF
            const pdfBuffer = await FacturaPDFService.generarPDF(id);

            // Configurar headers para descarga del PDF
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="Factura_${factura.numero_factura}.pdf"`);
            res.setHeader('Content-Length', pdfBuffer.length);

            // Enviar el PDF
            res.end(pdfBuffer);

        } catch (error) {
            console.error('Error generando PDF:', error);
            return ResponseProvider.error(res, 'Error al generar PDF de la factura');
        }
    }
}
