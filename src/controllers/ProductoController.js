/**
 * Controlador de Productos
 * Maneja todas las operaciones CRUD relacionadas con productos
 */

import { Producto } from "../models/Producto.js";
import { ResponseProvider } from "../providers/ResponseProvider.js";

export class ProductoController {

  /**
   * Obtiene todos los productos con paginación y filtros
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async obtenerProductos(req, res) {
    try {
      const { 
        pagina = 1, 
        limite = null, // Si no se especifica límite, traer todos
        busqueda = '',
        categoria = null,
        proveedor = null,
        estado = null
      } = req.query;
      
      const categoriaNum = categoria ? parseInt(categoria) : null;
      const proveedorNum = proveedor ? parseInt(proveedor) : null;
      
      // Si no hay límite, traer todos los productos
      if (!limite) {
        const productos = await Producto.obtenerTodosSinPaginacion(
          busqueda, 
          categoriaNum, 
          proveedorNum, 
          estado
        );
        return ResponseProvider.success(res, {
          message: "Productos obtenidos exitosamente",
          productos: productos
        });
      }
      
      const paginaNum = Math.max(1, parseInt(pagina));
      const limiteNum = Math.max(1, Math.min(100, parseInt(limite)));
      
      const resultado = await Producto.obtenerTodos(
        paginaNum, 
        limiteNum, 
        busqueda, 
        categoriaNum, 
        proveedorNum, 
        estado
      );
      
      return ResponseProvider.success(res, {
        message: "Productos obtenidos exitosamente",
        data: resultado
      });
      
    } catch (error) {
      console.error('Error en obtenerProductos:', error);
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }

  /**
   * Obtiene un producto por su ID
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async obtenerProductoPorId(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return ResponseProvider.error(res, {
          message: "ID de producto inválido",
          statusCode: 400
        });
      }
      
      const producto = await Producto.buscarPorId(parseInt(id));
      
      if (!producto) {
        return ResponseProvider.error(res, {
          message: "Producto no encontrado",
          statusCode: 404
        });
      }
      
      return ResponseProvider.success(res, {
        message: "Producto obtenido exitosamente",
        data: producto
      });
      
    } catch (error) {
      console.error('Error en obtenerProductoPorId:', error);
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }

  /**
   * Crea un nuevo producto
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async crearProducto(req, res) {
    try {
      const { 
        nombre_producto, 
        descripcion, 
        precio, 
        stock,
        id_categoria,
        id_proveedor,
        estado = 'DISPONIBLE'
      } = req.body;
      
      // Validaciones
      if (!nombre_producto || nombre_producto.trim() === '') {
        return ResponseProvider.error(res, {
          message: "El nombre del producto es requerido",
          statusCode: 400
        });
      }
      
      if (nombre_producto.length > 150) {
        return ResponseProvider.error(res, {
          message: "El nombre del producto no puede exceder 150 caracteres",
          statusCode: 400
        });
      }
      
      if (!precio || isNaN(parseFloat(precio)) || parseFloat(precio) < 0) {
        return ResponseProvider.error(res, {
          message: "El precio debe ser un número válido mayor o igual a 0",
          statusCode: 400
        });
      }
      
      if (stock !== undefined && (isNaN(parseInt(stock)) || parseInt(stock) < 0)) {
        return ResponseProvider.error(res, {
          message: "El stock debe ser un número entero mayor o igual a 0",
          statusCode: 400
        });
      }
      
      if (!id_categoria || isNaN(parseInt(id_categoria))) {
        return ResponseProvider.error(res, {
          message: "La categoría es requerida y debe ser válida",
          statusCode: 400
        });
      }
      
      if (id_proveedor && isNaN(parseInt(id_proveedor))) {
        return ResponseProvider.error(res, {
          message: "El proveedor debe ser válido",
          statusCode: 400
        });
      }
      
      const estadosValidos = ['DISPONIBLE', 'AGOTADO', 'DESCONTINUADO'];
      if (!estadosValidos.includes(estado)) {
        return ResponseProvider.error(res, {
          message: "El estado debe ser: DISPONIBLE, AGOTADO o DESCONTINUADO",
          statusCode: 400
        });
      }
      
      const datosProducto = {
        nombre_producto: nombre_producto.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        precio: parseFloat(precio),
        stock: stock !== undefined ? parseInt(stock) : 0,
        id_categoria: parseInt(id_categoria),
        id_proveedor: id_proveedor ? parseInt(id_proveedor) : null,
        estado
      };
      
      const nuevoProductoId = await Producto.crear(datosProducto);
      const nuevoProducto = await Producto.buscarPorId(nuevoProductoId);
      
      return ResponseProvider.success(res, {
        message: "Producto creado exitosamente",
        data: nuevoProducto,
        statusCode: 201
      });
      
    } catch (error) {
      console.error('Error en crearProducto:', error);
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }

  /**
   * Actualiza un producto existente
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async actualizarProducto(req, res) {
    try {
      const { id } = req.params;
      const { 
        nombre_producto, 
        descripcion, 
        precio, 
        stock,
        id_categoria,
        id_proveedor,
        estado
      } = req.body;
      
      if (!id || isNaN(parseInt(id))) {
        return ResponseProvider.error(res, {
          message: "ID de producto inválido",
          statusCode: 400
        });
      }
      
      // Verificar que el producto existe
      const productoExistente = await Producto.buscarPorId(parseInt(id));
      if (!productoExistente) {
        return ResponseProvider.error(res, {
          message: "Producto no encontrado",
          statusCode: 404
        });
      }
      
      // Validaciones
      if (!nombre_producto || nombre_producto.trim() === '') {
        return ResponseProvider.error(res, {
          message: "El nombre del producto es requerido",
          statusCode: 400
        });
      }
      
      if (nombre_producto.length > 150) {
        return ResponseProvider.error(res, {
          message: "El nombre del producto no puede exceder 150 caracteres",
          statusCode: 400
        });
      }
      
      if (!precio || isNaN(parseFloat(precio)) || parseFloat(precio) < 0) {
        return ResponseProvider.error(res, {
          message: "El precio debe ser un número válido mayor o igual a 0",
          statusCode: 400
        });
      }
      
      if (stock !== undefined && (isNaN(parseInt(stock)) || parseInt(stock) < 0)) {
        return ResponseProvider.error(res, {
          message: "El stock debe ser un número entero mayor o igual a 0",
          statusCode: 400
        });
      }
      
      if (!id_categoria || isNaN(parseInt(id_categoria))) {
        return ResponseProvider.error(res, {
          message: "La categoría es requerida y debe ser válida",
          statusCode: 400
        });
      }
      
      if (id_proveedor && isNaN(parseInt(id_proveedor))) {
        return ResponseProvider.error(res, {
          message: "El proveedor debe ser válido",
          statusCode: 400
        });
      }
      
      const estadosValidos = ['DISPONIBLE', 'AGOTADO', 'DESCONTINUADO'];
      if (estado && !estadosValidos.includes(estado)) {
        return ResponseProvider.error(res, {
          message: "El estado debe ser: DISPONIBLE, AGOTADO o DESCONTINUADO",
          statusCode: 400
        });
      }
      
      const datosActualizar = {
        nombre_producto: nombre_producto.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        precio: parseFloat(precio),
        stock: stock !== undefined ? parseInt(stock) : productoExistente.stock,
        id_categoria: parseInt(id_categoria),
        id_proveedor: id_proveedor ? parseInt(id_proveedor) : null,
        estado: estado || productoExistente.estado
      };
      
      const actualizado = await Producto.actualizar(parseInt(id), datosActualizar);
      
      if (!actualizado) {
        return ResponseProvider.error(res, {
          message: "No se pudo actualizar el producto",
          statusCode: 500
        });
      }
      
      const productoActualizado = await Producto.buscarPorId(parseInt(id));
      
      return ResponseProvider.success(res, {
        message: "Producto actualizado exitosamente",
        data: productoActualizado
      });
      
    } catch (error) {
      console.error('Error en actualizarProducto:', error);
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }

  /**
   * Elimina un producto
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async eliminarProducto(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return ResponseProvider.error(res, {
          message: "ID de producto inválido",
          statusCode: 400
        });
      }
      
      // Verificar que el producto existe
      const productoExistente = await Producto.buscarPorId(parseInt(id));
      if (!productoExistente) {
        return ResponseProvider.error(res, {
          message: "Producto no encontrado",
          statusCode: 404
        });
      }
      
      const eliminado = await Producto.eliminar(parseInt(id));
      
      if (!eliminado) {
        return ResponseProvider.error(res, {
          message: "No se pudo eliminar el producto",
          statusCode: 500
        });
      }
      
      return ResponseProvider.success(res, {
        message: "Producto eliminado exitosamente",
        statusCode: 204
      });
      
    } catch (error) {
      console.error('Error en eliminarProducto:', error);
      
      if (error.message.includes('carritos de compra') || 
          error.message.includes('ventas asociadas')) {
        return ResponseProvider.error(res, {
          message: error.message,
          statusCode: 409
        });
      }
      
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }

  /**
   * Actualiza el stock de un producto
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async actualizarStock(req, res) {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      
      if (!id || isNaN(parseInt(id))) {
        return ResponseProvider.error(res, {
          message: "ID de producto inválido",
          statusCode: 400
        });
      }
      
      if (stock === undefined || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
        return ResponseProvider.error(res, {
          message: "El stock debe ser un número entero mayor o igual a 0",
          statusCode: 400
        });
      }
      
      // Verificar que el producto existe
      const productoExistente = await Producto.buscarPorId(parseInt(id));
      if (!productoExistente) {
        return ResponseProvider.error(res, {
          message: "Producto no encontrado",
          statusCode: 404
        });
      }
      
      const actualizado = await Producto.actualizarStock(parseInt(id), parseInt(stock));
      
      if (!actualizado) {
        return ResponseProvider.error(res, {
          message: "No se pudo actualizar el stock",
          statusCode: 500
        });
      }
      
      const productoActualizado = await Producto.buscarPorId(parseInt(id));
      
      return ResponseProvider.success(res, {
        message: "Stock actualizado exitosamente",
        data: productoActualizado
      });
      
    } catch (error) {
      console.error('Error en actualizarStock:', error);
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }

  /**
   * Obtiene productos con stock bajo
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async obtenerStockBajo(req, res) {
    try {
      const { limite = 10 } = req.query;
      
      const limiteStock = Math.max(0, parseInt(limite));
      const productos = await Producto.obtenerStockBajo(limiteStock);
      
      return ResponseProvider.success(res, {
        message: "Productos con stock bajo obtenidos exitosamente",
        data: productos
      });
      
    } catch (error) {
      console.error('Error en obtenerStockBajo:', error);
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }

  /**
   * Busca productos por nombre
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async buscarProductos(req, res) {
    try {
      const { nombre } = req.query;
      
      if (!nombre || nombre.trim() === '') {
        return ResponseProvider.error(res, {
          message: "El nombre de búsqueda es requerido",
          statusCode: 400
        });
      }
      
      const productos = await Producto.buscarPorNombre(nombre.trim());
      
      return ResponseProvider.success(res, {
        message: "Búsqueda completada exitosamente",
        data: productos
      });
      
    } catch (error) {
      console.error('Error en buscarProductos:', error);
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }
}
