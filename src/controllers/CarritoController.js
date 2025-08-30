/**
 * Controlador de Carrito
 * Maneja todas las operaciones relacionadas con el carrito de compras
 */

import { Carrito } from "../models/Carrito.js";
import { ResponseProvider } from "../providers/ResponseProvider.js";

export class CarritoController {

  /**
   * Obtiene los productos del carrito del usuario autenticado
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async obtenerCarrito(req, res) {
    try {
      const idUsuario = req.usuario.id_usuario;
      
      const productos = await Carrito.obtenerProductosCarrito(idUsuario);
      const resumen = await Carrito.obtenerResumenCarrito(idUsuario);
      
      return ResponseProvider.success(res, {
        message: "Carrito obtenido exitosamente",
        productos: productos,
        resumen: resumen
      });
      
    } catch (error) {
      console.error('Error en obtenerCarrito:', error);
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }

  /**
   * Agrega un producto al carrito
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async agregarProducto(req, res) {
    try {
      const idUsuario = req.usuario.id_usuario;
      const { id_producto, cantidad = 1 } = req.body;
      
      // Validaciones
      if (!id_producto) {
        return ResponseProvider.error(res, {
          message: "El ID del producto es requerido",
          statusCode: 400
        });
      }
      
      if (cantidad <= 0) {
        return ResponseProvider.error(res, {
          message: "La cantidad debe ser mayor a 0",
          statusCode: 400
        });
      }
      
      await Carrito.agregarProducto(idUsuario, id_producto, cantidad);
      
      return ResponseProvider.success(res, {
        message: "Producto agregado al carrito exitosamente"
      });
      
    } catch (error) {
      console.error('Error en agregarProducto:', error);
      
      if (error.message.includes('no encontrado') || 
          error.message.includes('no disponible') ||
          error.message.includes('Stock insuficiente') ||
          error.message.includes('excede el stock')) {
        return ResponseProvider.error(res, {
          message: error.message,
          statusCode: 400
        });
      }
      
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }

  /**
   * Actualiza la cantidad de un producto en el carrito
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async actualizarCantidad(req, res) {
    try {
      const idUsuario = req.usuario.id_usuario;
      const { id_producto } = req.params;
      const { cantidad } = req.body;
      
      // Validaciones
      if (!cantidad || cantidad < 0) {
        return ResponseProvider.error(res, {
          message: "La cantidad debe ser un número válido mayor o igual a 0",
          statusCode: 400
        });
      }
      
      const resultado = await Carrito.actualizarCantidad(idUsuario, parseInt(id_producto), cantidad);
      
      if (!resultado) {
        return ResponseProvider.error(res, {
          message: "Producto no encontrado en el carrito",
          statusCode: 404
        });
      }
      
      return ResponseProvider.success(res, {
        message: cantidad > 0 ? "Cantidad actualizada exitosamente" : "Producto eliminado del carrito"
      });
      
    } catch (error) {
      console.error('Error en actualizarCantidad:', error);
      
      if (error.message.includes('Stock insuficiente') ||
          error.message.includes('no disponible')) {
        return ResponseProvider.error(res, {
          message: error.message,
          statusCode: 400
        });
      }
      
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }

  /**
   * Elimina un producto del carrito
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async eliminarProducto(req, res) {
    try {
      const idUsuario = req.usuario.id_usuario;
      const { id_producto } = req.params;
      
      const resultado = await Carrito.eliminarProducto(idUsuario, parseInt(id_producto));
      
      if (!resultado) {
        return ResponseProvider.error(res, {
          message: "Producto no encontrado en el carrito",
          statusCode: 404
        });
      }
      
      return ResponseProvider.success(res, {
        message: "Producto eliminado del carrito exitosamente"
      });
      
    } catch (error) {
      console.error('Error en eliminarProducto:', error);
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }

  /**
   * Vacía completamente el carrito del usuario
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async vaciarCarrito(req, res) {
    try {
      const idUsuario = req.usuario.id_usuario;
      
      await Carrito.vaciarCarrito(idUsuario);
      
      return ResponseProvider.success(res, {
        message: "Carrito vaciado exitosamente"
      });
      
    } catch (error) {
      console.error('Error en vaciarCarrito:', error);
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }

  /**
   * Obtiene solo el resumen del carrito (para mostrar en la UI)
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async obtenerResumen(req, res) {
    try {
      const idUsuario = req.usuario.id_usuario;
      
      const resumen = await Carrito.obtenerResumenCarrito(idUsuario);
      
      return ResponseProvider.success(res, {
        message: "Resumen del carrito obtenido exitosamente",
        resumen: resumen
      });
      
    } catch (error) {
      console.error('Error en obtenerResumen:', error);
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }
}
