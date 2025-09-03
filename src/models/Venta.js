/**
 * Modelo para la gestión de ventas
 * Maneja las operaciones CRUD para ventas y detalles de venta
 */

import db from '../utils/db.js';

export class Venta {
    /**
     * Procesa una venta desde el carrito del usuario
     */
    static async procesarVentaDesdeCarrito(idUsuario) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // 1. Obtener el carrito del usuario
            const [carrito] = await connection.execute(`
                SELECT c.id_carrito 
                FROM Carritos c 
                WHERE c.id_usuario = ?
            `, [idUsuario]);

            if (!carrito.length) {
                throw new Error('No se encontró un carrito para este usuario');
            }

            const idCarrito = carrito[0].id_carrito;

            // 2. Obtener productos del carrito con validaciones
            const [productosCarrito] = await connection.execute(`
                SELECT 
                    pc.id_producto,
                    pc.cantidad,
                    p.nombre_producto,
                    p.precio,
                    p.stock,
                    (pc.cantidad * p.precio) as subtotal
                FROM Productos_Carrito pc
                INNER JOIN Productos p ON pc.id_producto = p.id_producto
                WHERE pc.id_carrito = ? AND p.estado = 'DISPONIBLE'
            `, [idCarrito]);

            if (!productosCarrito.length) {
                throw new Error('El carrito está vacío o no contiene productos disponibles');
            }

            // 3. Validar stock suficiente
            for (const producto of productosCarrito) {
                if (producto.cantidad > producto.stock) {
                    throw new Error(`Stock insuficiente para ${producto.nombre_producto}. Disponible: ${producto.stock}, Solicitado: ${producto.cantidad}`);
                }
            }

            // 4. Calcular total de la venta
            console.log(productosCarrito);
            const totalVenta = productosCarrito.reduce((total, producto) => total + Number(producto.subtotal), 0);

            // pasar total vetna a string


            // 5. Crear la venta
            const [resultadoVenta] = await connection.execute(`
                INSERT INTO Ventas (id_usuario, total_venta, estado_venta)
                VALUES (?, ?, 'COMPLETADA')
            `, [idUsuario, Number(totalVenta)]);

            const idVenta = resultadoVenta.insertId;

            // 6. Crear detalles de la venta
            for (const producto of productosCarrito) {
                await connection.execute(`
                    INSERT INTO Detalles_Venta (id_venta, id_producto, cantidad, precio_unitario, subtotal_linea)
                    VALUES (?, ?, ?, ?, ?)
                `, [idVenta, producto.id_producto, producto.cantidad, producto.precio, producto.subtotal]);

                // 7. Actualizar stock de productos
                await connection.execute(`
                    UPDATE Productos 
                    SET stock = stock - ?,
                        estado = CASE 
                            WHEN stock - ? <= 0 THEN 'AGOTADO'
                            ELSE estado
                        END
                    WHERE id_producto = ?
                `, [producto.cantidad, producto.cantidad, producto.id_producto]);
            }

            // 8. Vaciar el carrito
            await connection.execute(`
                DELETE FROM Productos_Carrito WHERE id_carrito = ?
            `, [idCarrito]);

            await connection.commit();

            // 9. Obtener la venta completa
            return await this.obtenerVentaPorId(idVenta);

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtiene una venta por ID con todos sus detalles
     */
    static async obtenerVentaPorId(idVenta) {
        const [venta] = await db.execute(`
            SELECT 
                v.*,
                u.nombre_usuario,
                u.correo
            FROM Ventas v
            INNER JOIN Usuarios u ON v.id_usuario = u.id_usuario
            WHERE v.id_venta = ?
        `, [idVenta]);

        if (!venta.length) {
            throw new Error('Venta no encontrada');
        }

        const ventaData = venta[0];

        // Obtener detalles de la venta
        const [detalles] = await db.execute(`
            SELECT 
                dv.*,
                p.nombre_producto,
                p.descripcion
            FROM Detalles_Venta dv
            INNER JOIN Productos p ON dv.id_producto = p.id_producto
            WHERE dv.id_venta = ?
            ORDER BY dv.id_detalle_venta
        `, [idVenta]);

        return {
            ...ventaData,
            detalles
        };
    }

    /**
     * Obtiene todas las ventas de un usuario
     */
    static async obtenerVentasPorUsuario(idUsuario, limite = 10, offset = 0) {
        try {
            // Asegurar que limite y offset sean enteros
            const limiteInt = parseInt(limite) || 10;
            const offsetInt = parseInt(offset) || 0;
            
            // Usar una consulta con interpolación de strings para LIMIT y OFFSET
            // ya que algunos drivers de MySQL tienen problemas con parámetros en LIMIT/OFFSET
            const [ventas] = await db.execute(`
                SELECT 
                    v.id_venta,
                    v.fecha_venta,
                    v.total_venta,
                    v.estado_venta,
                    COUNT(dv.id_detalle_venta) as total_productos
                FROM Ventas v
                LEFT JOIN Detalles_Venta dv ON v.id_venta = dv.id_venta
                WHERE v.id_usuario = ?
                GROUP BY v.id_venta
                ORDER BY v.fecha_venta DESC
                LIMIT ${limiteInt} OFFSET ${offsetInt}
            `, [idUsuario]);

            return ventas;
        } catch (error) {
            console.error('Error en obtenerVentasPorUsuario:', error);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas de ventas
     */
    static async obtenerEstadisticasVentas(fechaInicio = null, fechaFin = null) {
        let query = `
            SELECT 
                COUNT(*) as total_ventas,
                SUM(total_venta) as ingresos_totales,
                AVG(total_venta) as venta_promedio,
                MIN(total_venta) as venta_minima,
                MAX(total_venta) as venta_maxima
            FROM Ventas 
            WHERE estado_venta = 'COMPLETADA'
        `;
        
        const params = [];
        
        if (fechaInicio) {
            query += ' AND fecha_venta >= ?';
            params.push(fechaInicio);
        }
        
        if (fechaFin) {
            query += ' AND fecha_venta <= ?';
            params.push(fechaFin);
        }

        const [estadisticas] = await db.execute(query, params);
        return estadisticas[0];
    }

    /**
     * Obtiene productos más vendidos
     */
    static async obtenerProductosMasVendidos(limite = 10) {
        const [productos] = await db.execute(`
            SELECT 
                p.id_producto,
                p.nombre_producto,
                p.precio,
                SUM(dv.cantidad) as total_vendido,
                SUM(dv.subtotal_linea) as ingresos_producto
            FROM Detalles_Venta dv
            INNER JOIN Productos p ON dv.id_producto = p.id_producto
            INNER JOIN Ventas v ON dv.id_venta = v.id_venta
            WHERE v.estado_venta = 'COMPLETADA'
            GROUP BY p.id_producto
            ORDER BY total_vendido DESC
            LIMIT ?
        `, [limite]);

        return productos;
    }

    /**
     * Cancela una venta (si es posible)
     */
    static async cancelarVenta(idVenta, idUsuario) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Verificar que la venta existe y pertenece al usuario
            const [venta] = await connection.execute(`
                SELECT * FROM Ventas 
                WHERE id_venta = ? AND id_usuario = ? AND estado_venta = 'COMPLETADA'
            `, [idVenta, idUsuario]);

            if (!venta.length) {
                throw new Error('Venta no encontrada o no se puede cancelar');
            }

            // Obtener detalles para restaurar stock
            const [detalles] = await connection.execute(`
                SELECT id_producto, cantidad FROM Detalles_Venta 
                WHERE id_venta = ?
            `, [idVenta]);

            // Restaurar stock
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

            // Marcar venta como cancelada
            await connection.execute(`
                UPDATE Ventas SET estado_venta = 'CANCELADA' WHERE id_venta = ?
            `, [idVenta]);

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}
