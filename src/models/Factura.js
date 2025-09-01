/**
 * Modelo para la gestión de facturas
 * Maneja las operaciones CRUD para facturas
 */

import db from '../utils/db.js';

export class Factura {
    /**
     * Genera una factura para una venta
     */
    static async generarFactura(idVenta) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Verificar que la venta existe y no tiene factura
            const [venta] = await connection.execute(`
                SELECT v.*, f.id_factura
                FROM Ventas v
                LEFT JOIN Facturas f ON v.id_venta = f.id_venta
                WHERE v.id_venta = ? AND v.estado_venta = 'COMPLETADA'
            `, [idVenta]);

            if (!venta.length) {
                throw new Error('Venta no encontrada o no está completada');
            }

            if (venta[0].id_factura) {
                throw new Error('Esta venta ya tiene una factura generada');
            }

            // Generar número de factura único
            const numeroFactura = await this.generarNumeroFactura();

            // Crear la factura
            const [resultado] = await connection.execute(`
                INSERT INTO Facturas (id_venta, numero_factura, monto_total, estado)
                VALUES (?, ?, ?, 'EMITIDA')
            `, [idVenta, numeroFactura, venta[0].total_venta]);

            const idFactura = resultado.insertId;

            await connection.commit();

            // Obtener la factura completa
            return await this.obtenerFacturaPorId(idFactura);

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Genera un número de factura único
     */
    static async generarNumeroFactura() {
        const año = new Date().getFullYear();
        const mes = String(new Date().getMonth() + 1).padStart(2, '0');
        
        // Obtener el último número de factura del mes
        const [ultimaFactura] = await db.execute(`
            SELECT numero_factura 
            FROM Facturas 
            WHERE numero_factura LIKE ?
            ORDER BY numero_factura DESC 
            LIMIT 1
        `, [`${año}${mes}%`]);

        let numeroSecuencial = 1;
        
        if (ultimaFactura.length > 0) {
            const ultimoNumero = ultimaFactura[0].numero_factura;
            const ultimoSecuencial = parseInt(ultimoNumero.slice(-4));
            numeroSecuencial = ultimoSecuencial + 1;
        }

        return `${año}${mes}${String(numeroSecuencial).padStart(4, '0')}`;
    }

    /**
     * Obtiene una factura por ID con todos sus detalles
     */
    static async obtenerFacturaPorId(idFactura) {
        const [factura] = await db.execute(`
            SELECT 
                f.*,
                v.id_usuario,
                v.fecha_venta,
                v.estado_venta,
                v.total_venta,
                u.nombre_usuario,
                u.correo,
                u.telefono,
                r.nombre_rol
            FROM Facturas f
            INNER JOIN Ventas v ON f.id_venta = v.id_venta
            INNER JOIN Usuarios u ON v.id_usuario = u.id_usuario
            LEFT JOIN Roles r ON u.id_rol = r.id_rol
            WHERE f.id_factura = ?
        `, [idFactura]);

        if (!factura.length) {
            throw new Error('Factura no encontrada');
        }

        const facturaData = factura[0];

        // Obtener detalles de la venta con información de productos
        const [detalles] = await db.execute(`
            SELECT 
                dv.id_detalle_venta,
                dv.cantidad,
                dv.precio_unitario,
                dv.subtotal_linea as subtotal,
                p.id_producto,
                p.nombre_producto,
                p.descripcion as producto_descripcion,
                p.precio as precio_actual,
                c.nombre_categoria,
                pr.nombre_proveedor
            FROM Detalles_Venta dv
            INNER JOIN Productos p ON dv.id_producto = p.id_producto
            INNER JOIN Categorias c ON p.id_categoria = c.id_categoria
            LEFT JOIN Proveedores pr ON p.id_proveedor = pr.id_proveedor
            WHERE dv.id_venta = ?
            ORDER BY dv.id_detalle_venta
        `, [facturaData.id_venta]);

        return {
            ...facturaData,
            items: detalles
        };
    }

    /**
     * Obtiene facturas por usuario
     */
    static async obtenerFacturasPorUsuario(idUsuario, limite = 10, offset = 0) {
        const [facturas] = await db.execute(`
            SELECT 
                f.id_factura,
                f.numero_factura,
                f.fecha_emision,
                f.monto_total,
                f.estado,
                v.fecha_venta
            FROM Facturas f
            INNER JOIN Ventas v ON f.id_venta = v.id_venta
            WHERE v.id_usuario = ?
            ORDER BY f.fecha_emision DESC
            LIMIT ? OFFSET ?
        `, [idUsuario, limite, offset]);

        return facturas;
    }

    /**
     * Obtiene todas las facturas (para administradores)
     */
    static async obtenerTodasLasFacturas(limite = 50, offset = 0) {
        // Convertir a enteros para seguridad
        const limiteInt = parseInt(limite) || 50;
        const offsetInt = parseInt(offset) || 0;
        
        const [facturas] = await db.execute(`
            SELECT 
                f.id_factura,
                f.numero_factura,
                f.fecha_emision as fecha_factura,
                f.monto_total as total_factura,
                f.estado as estado_factura,
                v.id_venta,
                v.fecha_venta,
                v.estado_venta,
                v.total_venta,
                u.id_usuario,
                u.nombre_usuario as cliente_nombre,
                u.correo as cliente_email,
                u.telefono as cliente_telefono,
                r.nombre_rol as cliente_rol,
                COUNT(dv.id_detalle_venta) as total_items
            FROM Facturas f
            INNER JOIN Ventas v ON f.id_venta = v.id_venta
            INNER JOIN Usuarios u ON v.id_usuario = u.id_usuario
            LEFT JOIN Roles r ON u.id_rol = r.id_rol
            LEFT JOIN Detalles_Venta dv ON v.id_venta = dv.id_venta
            GROUP BY f.id_factura, f.numero_factura, f.fecha_emision, f.monto_total, f.estado,
                     v.id_venta, v.fecha_venta, v.estado_venta, v.total_venta,
                     u.id_usuario, u.nombre_usuario, u.correo, u.telefono, r.nombre_rol
            ORDER BY f.fecha_emision DESC
            LIMIT ${limiteInt} OFFSET ${offsetInt}
        `);

        return facturas;
    }

    /**
     * Elimina una factura
     */
    static async eliminarFactura(idFactura) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Verificar que la factura existe
            const [factura] = await connection.execute(`
                SELECT * FROM Facturas WHERE id_factura = ?
            `, [idFactura]);

            if (!factura.length) {
                throw new Error('Factura no encontrada');
            }

            // Eliminar la factura
            await connection.execute(`
                DELETE FROM Facturas WHERE id_factura = ?
            `, [idFactura]);

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Busca facturas por número
     */
    static async buscarPorNumero(numeroFactura) {
        const [factura] = await db.execute(`
            SELECT 
                f.*,
                v.id_usuario,
                v.fecha_venta,
                u.nombre_usuario,
                u.correo
            FROM Facturas f
            INNER JOIN Ventas v ON f.id_venta = v.id_venta
            INNER JOIN Usuarios u ON v.id_usuario = u.id_usuario
            WHERE f.numero_factura = ?
        `, [numeroFactura]);

        return factura.length ? factura[0] : null;
    }

    /**
     * Marca una factura como pagada
     */
    static async marcarComoPagada(idFactura) {
        const [resultado] = await db.execute(`
            UPDATE Facturas 
            SET estado = 'PAGADA' 
            WHERE id_factura = ? AND estado = 'EMITIDA'
        `, [idFactura]);

        if (resultado.affectedRows === 0) {
            throw new Error('Factura no encontrada o ya está pagada');
        }

        return await this.obtenerFacturaPorId(idFactura);
    }

    /**
     * Anula una factura
     */
    static async anularFactura(idFactura, motivo = null) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Verificar que la factura existe y se puede anular
            const [factura] = await connection.execute(`
                SELECT f.*, v.id_venta, v.estado_venta
                FROM Facturas f
                INNER JOIN Ventas v ON f.id_venta = v.id_venta
                WHERE f.id_factura = ? AND f.estado IN ('EMITIDA', 'PAGADA')
            `, [idFactura]);

            if (!factura.length) {
                throw new Error('Factura no encontrada o no se puede anular');
            }

            // Anular la factura
            await connection.execute(`
                UPDATE Facturas 
                SET estado = 'ANULADA' 
                WHERE id_factura = ?
            `, [idFactura]);

            // Si la venta no está cancelada, cancelarla también
            if (factura[0].estado_venta === 'COMPLETADA') {
                await connection.execute(`
                    UPDATE Ventas 
                    SET estado_venta = 'CANCELADA' 
                    WHERE id_venta = ?
                `, [factura[0].id_venta]);

                // Restaurar stock de productos
                const [detalles] = await connection.execute(`
                    SELECT id_producto, cantidad FROM Detalles_Venta 
                    WHERE id_venta = ?
                `, [factura[0].id_venta]);

                for (const detalle of detalles) {
                    await connection.execute(`
                        UPDATE Productos 
                        SET stock = stock + ?,
                            estado = CASE 
                                WHEN estado = 'AGOTADO' AND stock + ? > 0 THEN 'DISPONIBLE'
                                ELSE estado
                            END
                        WHERE id_producto = ?
                    `, [detalle.cantidad, detalle.cantidad, detalle.id_producto]);
                }
            }

            await connection.commit();
            return await this.obtenerFacturaPorId(idFactura);

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtiene estadísticas de facturación
     */
    static async obtenerEstadisticas(fechaInicio = null, fechaFin = null) {
        let query = `
            SELECT 
                COUNT(*) as total_facturas,
                SUM(CASE WHEN estado = 'EMITIDA' THEN 1 ELSE 0 END) as facturas_emitidas,
                SUM(CASE WHEN estado = 'PAGADA' THEN 1 ELSE 0 END) as facturas_pagadas,
                SUM(CASE WHEN estado = 'ANULADA' THEN 1 ELSE 0 END) as facturas_anuladas,
                SUM(CASE WHEN estado != 'ANULADA' THEN monto_total ELSE 0 END) as monto_total_facturado,
                SUM(CASE WHEN estado = 'PAGADA' THEN monto_total ELSE 0 END) as monto_total_cobrado
            FROM Facturas 
            WHERE 1=1
        `;
        
        const params = [];
        
        if (fechaInicio) {
            query += ' AND fecha_emision >= ?';
            params.push(fechaInicio);
        }
        
        if (fechaFin) {
            query += ' AND fecha_emision <= ?';
            params.push(fechaFin);
        }

        const [estadisticas] = await db.execute(query, params);
        return estadisticas[0];
    }
}
