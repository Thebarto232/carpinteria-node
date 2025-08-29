/**
 * Controlador de Categorías
 * Maneja todas las operaciones CRUD relacionadas con categorías
 */

import { Categoria } from "../models/Categoria.js";
import { ResponseProvider } from "../providers/ResponseProvider.js";

export class CategoriaController {

  /**
   * Obtiene todas las categorías con paginación y filtros
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async obtenerCategorias(req, res) {
    try {
      const { 
        pagina = 1, 
        limite = null, // Si no se especifica límite, traer todas
        busqueda = '' 
      } = req.query;
      
      // Si no hay límite, traer todas las categorías
      if (!limite) {
        const categorias = await Categoria.obtenerTodasSinPaginacion(busqueda);
        return ResponseProvider.success(res, {
          message: "Categorías obtenidas exitosamente",
          categorias: categorias
        });
      }
      
      const paginaNum = Math.max(1, parseInt(pagina));
      const limiteNum = Math.max(1, Math.min(100, parseInt(limite)));
      
      const resultado = await Categoria.obtenerTodas(paginaNum, limiteNum, busqueda);
      
      return ResponseProvider.success(res, {
        message: "Categorías obtenidas exitosamente",
        data: resultado
      });
      
    } catch (error) {
      console.error('Error en obtenerCategorias:', error);
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }

  /**
   * Obtiene todas las categorías sin paginación (para selects)
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async obtenerCategoriasSimple(req, res) {
    try {
      const categorias = await Categoria.obtenerTodasSimple();
      
      return ResponseProvider.success(res, {
        message: "Categorías obtenidas exitosamente",
        data: categorias
      });
      
    } catch (error) {
      console.error('Error en obtenerCategoriasSimple:', error);
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }

  /**
   * Obtiene una categoría por su ID
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async obtenerCategoriaPorId(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return ResponseProvider.error(res, {
          message: "ID de categoría inválido",
          statusCode: 400
        });
      }
      
      const categoria = await Categoria.buscarPorId(parseInt(id));
      
      if (!categoria) {
        return ResponseProvider.error(res, {
          message: "Categoría no encontrada",
          statusCode: 404
        });
      }
      
      return ResponseProvider.success(res, {
        message: "Categoría obtenida exitosamente",
        data: categoria
      });
      
    } catch (error) {
      console.error('Error en obtenerCategoriaPorId:', error);
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }

  /**
   * Crea una nueva categoría
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async crearCategoria(req, res) {
    try {
      const { nombre_categoria, descripcion } = req.body;
      
      // Validaciones
      if (!nombre_categoria || nombre_categoria.trim() === '') {
        return ResponseProvider.error(res, {
          message: "El nombre de la categoría es requerido",
          statusCode: 400
        });
      }
      
      if (nombre_categoria.length > 100) {
        return ResponseProvider.error(res, {
          message: "El nombre de la categoría no puede exceder 100 caracteres",
          statusCode: 400
        });
      }
      
      const datosCategoria = {
        nombre_categoria: nombre_categoria.trim(),
        descripcion: descripcion ? descripcion.trim() : null
      };
      
      const nuevaCategoriaId = await Categoria.crear(datosCategoria);
      const nuevaCategoria = await Categoria.buscarPorId(nuevaCategoriaId);
      
      return ResponseProvider.success(res, {
        message: "Categoría creada exitosamente",
        data: nuevaCategoria,
        statusCode: 201
      });
      
    } catch (error) {
      console.error('Error en crearCategoria:', error);
      
      if (error.message === 'El nombre de la categoría ya existe') {
        return ResponseProvider.error(res, {
          message: "Ya existe una categoría con ese nombre",
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
   * Actualiza una categoría existente
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async actualizarCategoria(req, res) {
    try {
      const { id } = req.params;
      const { nombre_categoria, descripcion } = req.body;
      
      if (!id || isNaN(parseInt(id))) {
        return ResponseProvider.error(res, {
          message: "ID de categoría inválido",
          statusCode: 400
        });
      }
      
      // Verificar que la categoría existe
      const categoriaExistente = await Categoria.buscarPorId(parseInt(id));
      if (!categoriaExistente) {
        return ResponseProvider.error(res, {
          message: "Categoría no encontrada",
          statusCode: 404
        });
      }
      
      // Validaciones
      if (!nombre_categoria || nombre_categoria.trim() === '') {
        return ResponseProvider.error(res, {
          message: "El nombre de la categoría es requerido",
          statusCode: 400
        });
      }
      
      if (nombre_categoria.length > 100) {
        return ResponseProvider.error(res, {
          message: "El nombre de la categoría no puede exceder 100 caracteres",
          statusCode: 400
        });
      }
      
      const datosActualizar = {
        nombre_categoria: nombre_categoria.trim(),
        descripcion: descripcion ? descripcion.trim() : null
      };
      
      const actualizado = await Categoria.actualizar(parseInt(id), datosActualizar);
      
      if (!actualizado) {
        return ResponseProvider.error(res, {
          message: "No se pudo actualizar la categoría",
          statusCode: 500
        });
      }
      
      const categoriaActualizada = await Categoria.buscarPorId(parseInt(id));
      
      return ResponseProvider.success(res, {
        message: "Categoría actualizada exitosamente",
        data: categoriaActualizada
      });
      
    } catch (error) {
      console.error('Error en actualizarCategoria:', error);
      
      if (error.message === 'El nombre de la categoría ya existe') {
        return ResponseProvider.error(res, {
          message: "Ya existe una categoría con ese nombre",
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
   * Elimina una categoría
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async eliminarCategoria(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return ResponseProvider.error(res, {
          message: "ID de categoría inválido",
          statusCode: 400
        });
      }
      
      // Verificar que la categoría existe
      const categoriaExistente = await Categoria.buscarPorId(parseInt(id));
      if (!categoriaExistente) {
        return ResponseProvider.error(res, {
          message: "Categoría no encontrada",
          statusCode: 404
        });
      }
      
      const eliminado = await Categoria.eliminar(parseInt(id));
      
      if (!eliminado) {
        return ResponseProvider.error(res, {
          message: "No se pudo eliminar la categoría",
          statusCode: 500
        });
      }
      
      return ResponseProvider.success(res, {
        message: "Categoría eliminada exitosamente",
        statusCode: 204
      });
      
    } catch (error) {
      console.error('Error en eliminarCategoria:', error);
      
      if (error.message === 'No se puede eliminar la categoría porque tiene productos asociados') {
        return ResponseProvider.error(res, {
          message: "No se puede eliminar la categoría porque tiene productos asociados",
          statusCode: 409
        });
      }
      
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }
}
