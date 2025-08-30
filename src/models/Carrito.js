/**
 * Modelo de Carrito para la gestión de carritos de compra
 * Maneja operaciones CRUD y validaciones relacionadas con carritos
 */

import { ejecutarQuery } from "../utils/db.js";

export class Carrito {

  /**
   * Obtiene o crea el carrito de un usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>} - Carrito del usuario
   */
  static async obtenerOCrearCarrito(idUsuario) {
    try {
      // Buscar carrito existente
      let query = `
        SELECT id_carrito
        FROM Carritos
        WHERE id_usuario = ?
      `;
      
      let resultado = await ejecutarQuery(query, [idUsuario]);
      
      if (resultado.length > 0) {
        return { id_carrito: resultado[0].id_carrito };
      }
      
      // Crear nuevo carrito si no existe
      query = `
        INSERT INTO Carritos (id_usuario)
        VALUES (?)
      `;
      
      resultado = await ejecutarQuery(query, [idUsuario]);
      return { id_carrito: resultado.insertId };
      
    } catch (error) {
      console.error('Error al obtener o crear carrito:', error);
      throw error;
    }
  }

  /**
   * Obtiene los productos del carrito de un usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Array>} - Productos en el carrito
   */
  static async obtenerProductosCarrito(idUsuario) {
    try {
      const query = `
        SELECT 
          pc.id_carrito,
          pc.id_producto,
          pc.cantidad,
          p.nombre_producto,
          p.descripcion,
          p.precio,
          p.stock,
          p.estado,
          c.nombre_categoria,
          pr.nombre_proveedor,
          (pc.cantidad * p.precio) as subtotal
        FROM Productos_Carrito pc
        INNER JOIN Carritos car ON pc.id_carrito = car.id_carrito
        INNER JOIN Productos p ON pc.id_producto = p.id_producto
        LEFT JOIN Categorias c ON p.id_categoria = c.id_categoria
        LEFT JOIN Proveedores pr ON p.id_proveedor = pr.id_proveedor
        WHERE car.id_usuario = ? AND p.estado = 'DISPONIBLE'
        ORDER BY p.nombre_producto ASC
      `;
      
      return await ejecutarQuery(query, [idUsuario]);
      
    } catch (error) {
      console.error('Error al obtener productos del carrito:', error);
      throw error;
    }
  }

  /**
   * Agrega un producto al carrito
   * @param {number} idUsuario - ID del usuario
   * @param {number} idProducto - ID del producto
   * @param {number} cantidad - Cantidad a agregar
   * @returns {Promise<boolean>} - True si se agregó correctamente
   */
  static async agregarProducto(idUsuario, idProducto, cantidad = 1) {
    try {
      // Verificar que el producto existe y está disponible
      const queryProducto = `
        SELECT id_producto, stock, estado
        FROM Productos
        WHERE id_producto = ? AND estado = 'DISPONIBLE'
      `;
      
      const producto = await ejecutarQuery(queryProducto, [idProducto]);
      if (producto.length === 0) {
        throw new Error('Producto no encontrado o no disponible');
      }
      
      if (producto[0].stock < cantidad) {
        throw new Error('Stock insuficiente');
      }

      // Obtener o crear carrito
      const carrito = await this.obtenerOCrearCarrito(idUsuario);
      
      // Verificar si el producto ya está en el carrito
      const queryExistente = `
        SELECT cantidad
        FROM Productos_Carrito
        WHERE id_carrito = ? AND id_producto = ?
      `;
      
      const existente = await ejecutarQuery(queryExistente, [carrito.id_carrito, idProducto]);
      
      if (existente.length > 0) {
        // Actualizar cantidad existente
        const nuevaCantidad = existente[0].cantidad + cantidad;
        
        if (nuevaCantidad > producto[0].stock) {
          throw new Error('La cantidad total excede el stock disponible');
        }
        
        const queryActualizar = `
          UPDATE Productos_Carrito
          SET cantidad = ?
          WHERE id_carrito = ? AND id_producto = ?
        `;
        
        await ejecutarQuery(queryActualizar, [nuevaCantidad, carrito.id_carrito, idProducto]);
      } else {
        // Insertar nuevo producto
        const queryInsertar = `
          INSERT INTO Productos_Carrito (id_carrito, id_producto, cantidad)
          VALUES (?, ?, ?)
        `;
        
        await ejecutarQuery(queryInsertar, [carrito.id_carrito, idProducto, cantidad]);
      }
      
      return true;
      
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      throw error;
    }
  }

  /**
   * Actualiza la cantidad de un producto en el carrito
   * @param {number} idUsuario - ID del usuario
   * @param {number} idProducto - ID del producto
   * @param {number} cantidad - Nueva cantidad
   * @returns {Promise<boolean>} - True si se actualizó correctamente
   */
  static async actualizarCantidad(idUsuario, idProducto, cantidad) {
    try {
      if (cantidad <= 0) {
        return await this.eliminarProducto(idUsuario, idProducto);
      }

      // Verificar stock
      const queryProducto = `
        SELECT stock
        FROM Productos
        WHERE id_producto = ? AND estado = 'DISPONIBLE'
      `;
      
      const producto = await ejecutarQuery(queryProducto, [idProducto]);
      if (producto.length === 0) {
        throw new Error('Producto no encontrado o no disponible');
      }
      
      if (producto[0].stock < cantidad) {
        throw new Error('Stock insuficiente');
      }

      // Obtener carrito
      const carrito = await this.obtenerOCrearCarrito(idUsuario);
      
      const query = `
        UPDATE Productos_Carrito
        SET cantidad = ?
        WHERE id_carrito = ? AND id_producto = ?
      `;
      
      const resultado = await ejecutarQuery(query, [cantidad, carrito.id_carrito, idProducto]);
      return resultado.affectedRows > 0;
      
    } catch (error) {
      console.error('Error al actualizar cantidad en carrito:', error);
      throw error;
    }
  }

  /**
   * Elimina un producto del carrito
   * @param {number} idUsuario - ID del usuario
   * @param {number} idProducto - ID del producto
   * @returns {Promise<boolean>} - True si se eliminó correctamente
   */
  static async eliminarProducto(idUsuario, idProducto) {
    try {
      // Obtener carrito
      const carrito = await this.obtenerOCrearCarrito(idUsuario);
      
      const query = `
        DELETE FROM Productos_Carrito
        WHERE id_carrito = ? AND id_producto = ?
      `;
      
      const resultado = await ejecutarQuery(query, [carrito.id_carrito, idProducto]);
      return resultado.affectedRows > 0;
      
    } catch (error) {
      console.error('Error al eliminar producto del carrito:', error);
      throw error;
    }
  }

  /**
   * Vacía completamente el carrito de un usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<boolean>} - True si se vació correctamente
   */
  static async vaciarCarrito(idUsuario) {
    try {
      // Obtener carrito
      const carrito = await this.obtenerOCrearCarrito(idUsuario);
      
      const query = `
        DELETE FROM Productos_Carrito
        WHERE id_carrito = ?
      `;
      
      const resultado = await ejecutarQuery(query, [carrito.id_carrito]);
      return resultado.affectedRows >= 0; // Puede ser 0 si ya estaba vacío
      
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
      throw error;
    }
  }

  /**
   * Obtiene el resumen del carrito (total de productos y precio)
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>} - Resumen del carrito
   */
  static async obtenerResumenCarrito(idUsuario) {
    try {
      const query = `
        SELECT 
          COUNT(pc.id_producto) as total_productos,
          SUM(pc.cantidad) as total_cantidad,
          SUM(pc.cantidad * p.precio) as total_precio
        FROM Productos_Carrito pc
        INNER JOIN Carritos car ON pc.id_carrito = car.id_carrito
        INNER JOIN Productos p ON pc.id_producto = p.id_producto
        WHERE car.id_usuario = ? AND p.estado = 'DISPONIBLE'
      `;
      
      const resultado = await ejecutarQuery(query, [idUsuario]);
      
      return {
        total_productos: resultado[0].total_productos || 0,
        total_cantidad: resultado[0].total_cantidad || 0,
        total_precio: parseFloat(resultado[0].total_precio || 0)
      };
      
    } catch (error) {
      console.error('Error al obtener resumen del carrito:', error);
      throw error;
    }
  }
}
