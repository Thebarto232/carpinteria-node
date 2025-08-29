/**
 * Modelo de Producto para la gestión de productos
 * Maneja operaciones CRUD y validaciones relacionadas con productos
 */

import { ejecutarQuery } from "../utils/db.js";

export class Producto {
  
  /**
   * Busca un producto por su ID
   * @param {number} id - ID del producto
   * @returns {Promise<Object|null>} - Producto encontrado o null
   */
  static async buscarPorId(id) {
    try {
      const query = `
        SELECT 
          p.id_producto,
          p.nombre_producto,
          p.descripcion,
          p.precio,
          p.stock,
          p.estado,
          p.fecha_creacion,
          p.id_categoria,
          p.id_proveedor,
          c.nombre_categoria,
          pr.nombre_proveedor
        FROM Productos p
        LEFT JOIN Categorias c ON p.id_categoria = c.id_categoria
        LEFT JOIN Proveedores pr ON p.id_proveedor = pr.id_proveedor
        WHERE p.id_producto = ?
      `;
      
      const filas = await ejecutarQuery(query, [id]);
      return filas[0] || null;
    } catch (error) {
      console.error('Error al buscar producto por ID:', error);
      throw error;
    }
  }

  /**
   * Busca productos por nombre
   * @param {string} nombre - Nombre del producto
   * @returns {Promise<Array>} - Productos encontrados
   */
  static async buscarPorNombre(nombre) {
    try {
      const query = `
        SELECT 
          p.id_producto,
          p.nombre_producto,
          p.descripcion,
          p.precio,
          p.stock,
          p.estado,
          p.fecha_creacion,
          p.id_categoria,
          p.id_proveedor,
          c.nombre_categoria,
          pr.nombre_proveedor
        FROM Productos p
        LEFT JOIN Categorias c ON p.id_categoria = c.id_categoria
        LEFT JOIN Proveedores pr ON p.id_proveedor = pr.id_proveedor
        WHERE p.nombre_producto LIKE ?
      `;
      
      return await ejecutarQuery(query, [`%${nombre}%`]);
    } catch (error) {
      console.error('Error al buscar productos por nombre:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo producto en la base de datos
   * @param {Object} datosProducto - Datos del producto
   * @param {string} datosProducto.nombre_producto - Nombre del producto
   * @param {string} datosProducto.descripcion - Descripción del producto (opcional)
   * @param {number} datosProducto.precio - Precio del producto
   * @param {number} datosProducto.stock - Stock inicial del producto
   * @param {number} datosProducto.id_categoria - ID de la categoría
   * @param {number} datosProducto.id_proveedor - ID del proveedor (opcional)
   * @param {string} datosProducto.estado - Estado del producto (opcional, por defecto 'DISPONIBLE')
   * @returns {Promise<number>} - ID del producto creado
   */
  static async crear({ 
    nombre_producto, 
    descripcion = null, 
    precio, 
    stock = 0,
    id_categoria,
    id_proveedor = null,
    estado = 'DISPONIBLE'
  }) {
    try {
      const query = `
        INSERT INTO Productos (
          nombre_producto, 
          descripcion, 
          precio, 
          stock, 
          id_categoria, 
          id_proveedor, 
          estado
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const resultado = await ejecutarQuery(query, [
        nombre_producto, 
        descripcion, 
        precio, 
        stock, 
        id_categoria, 
        id_proveedor, 
        estado
      ]);
      
      return resultado.insertId;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  }

  /**
   * Actualiza la información de un producto
   * @param {number} id - ID del producto
   * @param {Object} datosActualizar - Datos a actualizar
   * @returns {Promise<boolean>} - True si se actualizó correctamente
   */
  static async actualizar(id, datosActualizar) {
    try {
      const { 
        nombre_producto, 
        descripcion, 
        precio, 
        stock,
        id_categoria,
        id_proveedor,
        estado
      } = datosActualizar;
      
      const query = `
        UPDATE Productos 
        SET 
          nombre_producto = ?, 
          descripcion = ?, 
          precio = ?, 
          stock = ?,
          id_categoria = ?,
          id_proveedor = ?,
          estado = ?
        WHERE id_producto = ?
      `;
      
      const resultado = await ejecutarQuery(query, [
        nombre_producto, 
        descripcion, 
        precio, 
        stock,
        id_categoria,
        id_proveedor,
        estado,
        id
      ]);
      
      return resultado.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  }

  /**
   * Elimina un producto
   * @param {number} id - ID del producto
   * @returns {Promise<boolean>} - True si se eliminó correctamente
   */
  static async eliminar(id) {
    try {
      // Verificar si el producto está en carritos
      const queryCarritos = `
        SELECT COUNT(*) as total
        FROM Productos_Carrito
        WHERE id_producto = ?
      `;
      
      const resultadoCarritos = await ejecutarQuery(queryCarritos, [id]);
      if (resultadoCarritos[0].total > 0) {
        throw new Error('No se puede eliminar el producto porque está en carritos de compra');
      }

      // Verificar si el producto está en detalles de venta
      const queryVentas = `
        SELECT COUNT(*) as total
        FROM Detalles_Venta
        WHERE id_producto = ?
      `;
      
      const resultadoVentas = await ejecutarQuery(queryVentas, [id]);
      if (resultadoVentas[0].total > 0) {
        throw new Error('No se puede eliminar el producto porque tiene ventas asociadas');
      }

      // Eliminar imágenes del producto primero
      const queryImagenes = `
        DELETE FROM Imagenes_Producto 
        WHERE id_producto = ?
      `;
      await ejecutarQuery(queryImagenes, [id]);

      // Eliminar reseñas del producto
      const queryReseñas = `
        DELETE FROM Reseñas 
        WHERE id_producto = ?
      `;
      await ejecutarQuery(queryReseñas, [id]);

      // Eliminar el producto
      const query = `
        DELETE FROM Productos 
        WHERE id_producto = ?
      `;
      
      const resultado = await ejecutarQuery(query, [id]);
      return resultado.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los productos con paginación
   * @param {number} pagina - Número de página
   * @param {number} limite - Límite de registros por página
   * @param {string} busqueda - Término de búsqueda (opcional)
   * @param {number} categoria - Filtro por categoría (opcional)
   * @param {number} proveedor - Filtro por proveedor (opcional)
   * @param {string} estado - Filtro por estado (opcional)
   * @returns {Promise<Object>} - Productos y metadatos de paginación
   */
  static async obtenerTodos(pagina = 1, limite = 10, busqueda = '', categoria = null, proveedor = null, estado = null) {
    try {
      const offset = (pagina - 1) * limite;
      
      let whereClause = "WHERE 1=1";
      const parametros = [];
      
      if (busqueda) {
        whereClause += " AND (p.nombre_producto LIKE ? OR p.descripcion LIKE ?)";
        parametros.push(`%${busqueda}%`, `%${busqueda}%`);
      }
      
      if (categoria) {
        whereClause += " AND p.id_categoria = ?";
        parametros.push(categoria);
      }
      
      if (proveedor) {
        whereClause += " AND p.id_proveedor = ?";
        parametros.push(proveedor);
      }
      
      if (estado) {
        whereClause += " AND p.estado = ?";
        parametros.push(estado);
      }
      
      // Consulta para obtener productos
      const query = `
        SELECT 
          p.id_producto,
          p.nombre_producto,
          p.descripcion,
          p.precio,
          p.stock,
          p.estado,
          p.fecha_creacion,
          p.id_categoria,
          p.id_proveedor,
          c.nombre_categoria,
          pr.nombre_proveedor,
          (SELECT COUNT(*) FROM Reseñas r WHERE r.id_producto = p.id_producto) as total_reseñas,
          (SELECT AVG(r.calificacion) FROM Reseñas r WHERE r.id_producto = p.id_producto) as calificacion_promedio
        FROM Productos p
        LEFT JOIN Categorias c ON p.id_categoria = c.id_categoria
        LEFT JOIN Proveedores pr ON p.id_proveedor = pr.id_proveedor
        ${whereClause}
        ORDER BY p.fecha_creacion DESC
        LIMIT ${limite} OFFSET ${offset}
      `;
      
      const productos = await ejecutarQuery(query, parametros);
      
      // Consulta para contar total de registros
      const queryConteo = `
        SELECT COUNT(*) as total
        FROM Productos p
        LEFT JOIN Categorias c ON p.id_categoria = c.id_categoria
        LEFT JOIN Proveedores pr ON p.id_proveedor = pr.id_proveedor
        ${whereClause}
      `;
      
      const resultadoConteo = await ejecutarQuery(queryConteo, parametros);
      const total = resultadoConteo[0].total;
      
      return {
        productos,
        paginacion: {
          paginaActual: pagina,
          totalPaginas: Math.ceil(total / limite),
          totalRegistros: total,
          registrosPorPagina: limite
        }
      };
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  }

  /**
   * Actualiza el stock de un producto
   * @param {number} id - ID del producto
   * @param {number} nuevoStock - Nuevo stock
   * @returns {Promise<boolean>} - True si se actualizó correctamente
   */
  static async actualizarStock(id, nuevoStock) {
    try {
      const query = `
        UPDATE Productos 
        SET stock = ?,
            estado = CASE 
              WHEN ? <= 0 THEN 'AGOTADO'
              ELSE 'DISPONIBLE'
            END
        WHERE id_producto = ?
      `;
      
      const resultado = await ejecutarQuery(query, [nuevoStock, nuevoStock, id]);
      return resultado.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      throw error;
    }
  }

  /**
   * Obtiene productos con stock bajo
   * @param {number} limite - Límite de stock considerado bajo (por defecto 10)
   * @returns {Promise<Array>} - Productos con stock bajo
   */
  static async obtenerStockBajo(limite = 10) {
    try {
      const query = `
        SELECT 
          p.id_producto,
          p.nombre_producto,
          p.stock,
          c.nombre_categoria,
          pr.nombre_proveedor
        FROM Productos p
        LEFT JOIN Categorias c ON p.id_categoria = c.id_categoria
        LEFT JOIN Proveedores pr ON p.id_proveedor = pr.id_proveedor
        WHERE p.stock <= ? AND p.estado != 'DESCONTINUADO'
        ORDER BY p.stock ASC
      `;
      
      return await ejecutarQuery(query, [limite]);
    } catch (error) {
      console.error('Error al obtener productos con stock bajo:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los productos sin paginación con filtros
   * @param {string} busqueda - Término de búsqueda (opcional)
   * @param {number} categoria - Filtro por categoría (opcional)
   * @param {number} proveedor - Filtro por proveedor (opcional)
   * @param {string} estado - Filtro por estado (opcional)
   * @returns {Promise<Array>} - Lista de todos los productos
   */
  static async obtenerTodosSinPaginacion(busqueda = '', categoria = null, proveedor = null, estado = null) {
    try {
      let whereClause = "";
      const parametros = [];
      const condiciones = [];

      if (busqueda) {
        condiciones.push(`(
          p.nombre_producto LIKE ? OR 
          p.descripcion LIKE ? OR 
          c.nombre_categoria LIKE ? OR 
          pr.nombre_proveedor LIKE ?
        )`);
        parametros.push(`%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`);
      }

      if (categoria) {
        condiciones.push("p.id_categoria = ?");
        parametros.push(categoria);
      }

      if (proveedor) {
        condiciones.push("p.id_proveedor = ?");
        parametros.push(proveedor);
      }

      if (estado) {
        condiciones.push("p.estado = ?");
        parametros.push(estado);
      }

      if (condiciones.length > 0) {
        whereClause = `WHERE ${condiciones.join(' AND ')}`;
      }

      const query = `
        SELECT 
          p.id_producto,
          p.nombre_producto,
          p.descripcion,
          p.precio,
          p.stock,
          p.estado,
          p.fecha_creacion,
          c.id_categoria,
          c.nombre_categoria,
          pr.id_proveedor,
          pr.nombre_proveedor
        FROM Productos p
        LEFT JOIN Categorias c ON p.id_categoria = c.id_categoria
        LEFT JOIN Proveedores pr ON p.id_proveedor = pr.id_proveedor
        ${whereClause}
        ORDER BY p.nombre_producto ASC
      `;

      return await ejecutarQuery(query, parametros);
    } catch (error) {
      console.error('Error al obtener todos los productos:', error);
      throw error;
    }
  }
}
