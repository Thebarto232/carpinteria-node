/**
 * Modelo de Categoria para la gestión de categorías de productos
 * Maneja operaciones CRUD y validaciones relacionadas con categorías
 */

import { ejecutarQuery } from "../utils/db.js";

export class Categoria {
  
  /**
   * Busca una categoría por su ID
   * @param {number} id - ID de la categoría
   * @returns {Promise<Object|null>} - Categoría encontrada o null
   */
  static async buscarPorId(id) {
    try {
      const query = `
        SELECT 
          id_categoria,
          nombre_categoria,
          descripcion
        FROM Categorias
        WHERE id_categoria = ?
      `;
      
      const filas = await ejecutarQuery(query, [id]);
      return filas[0] || null;
    } catch (error) {
      console.error('Error al buscar categoría por ID:', error);
      throw error;
    }
  }

  /**
   * Busca una categoría por su nombre
   * @param {string} nombre - Nombre de la categoría
   * @returns {Promise<Object|null>} - Categoría encontrada o null
   */
  static async buscarPorNombre(nombre) {
    try {
      const query = `
        SELECT 
          id_categoria,
          nombre_categoria,
          descripcion
        FROM Categorias
        WHERE nombre_categoria = ?
      `;
      
      const filas = await ejecutarQuery(query, [nombre]);
      return filas[0] || null;
    } catch (error) {
      console.error('Error al buscar categoría por nombre:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva categoría en la base de datos
   * @param {Object} datosCategoria - Datos de la categoría
   * @param {string} datosCategoria.nombre_categoria - Nombre de la categoría
   * @param {string} datosCategoria.descripcion - Descripción de la categoría (opcional)
   * @returns {Promise<number>} - ID de la categoría creada
   */
  static async crear({ nombre_categoria, descripcion = null }) {
    try {
      // Verificar si el nombre ya existe
      const categoriaExistente = await this.buscarPorNombre(nombre_categoria);
      if (categoriaExistente) {
        throw new Error('El nombre de la categoría ya existe');
      }

      const query = `
        INSERT INTO Categorias (nombre_categoria, descripcion)
        VALUES (?, ?)
      `;
      
      const resultado = await ejecutarQuery(query, [nombre_categoria, descripcion]);
      return resultado.insertId;
    } catch (error) {
      console.error('Error al crear categoría:', error);
      throw error;
    }
  }

  /**
   * Actualiza la información de una categoría
   * @param {number} id - ID de la categoría
   * @param {Object} datosActualizar - Datos a actualizar
   * @returns {Promise<boolean>} - True si se actualizó correctamente
   */
  static async actualizar(id, datosActualizar) {
    try {
      const { nombre_categoria, descripcion } = datosActualizar;
      
      // Verificar si el nuevo nombre ya existe en otra categoría
      if (nombre_categoria) {
        const categoriaExistente = await this.buscarPorNombre(nombre_categoria);
        if (categoriaExistente && categoriaExistente.id_categoria !== id) {
          throw new Error('El nombre de la categoría ya existe');
        }
      }
      
      const query = `
        UPDATE Categorias 
        SET nombre_categoria = ?, descripcion = ?
        WHERE id_categoria = ?
      `;
      
      const resultado = await ejecutarQuery(query, [nombre_categoria, descripcion, id]);
      return resultado.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      throw error;
    }
  }

  /**
   * Elimina una categoría
   * @param {number} id - ID de la categoría
   * @returns {Promise<boolean>} - True si se eliminó correctamente
   */
  static async eliminar(id) {
    try {
      // Verificar si la categoría tiene productos asociados
      const queryProductos = `
        SELECT COUNT(*) as total
        FROM Productos
        WHERE id_categoria = ?
      `;
      
      const resultadoProductos = await ejecutarQuery(queryProductos, [id]);
      if (resultadoProductos[0].total > 0) {
        throw new Error('No se puede eliminar la categoría porque tiene productos asociados');
      }

      const query = `
        DELETE FROM Categorias 
        WHERE id_categoria = ?
      `;
      
      const resultado = await ejecutarQuery(query, [id]);
      return resultado.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las categorías con paginación
   * @param {number} pagina - Número de página
   * @param {number} limite - Límite de registros por página
   * @param {string} busqueda - Término de búsqueda (opcional)
   * @returns {Promise<Object>} - Categorías y metadatos de paginación
   */
  static async obtenerTodas(pagina = 1, limite = 10, busqueda = '') {
    try {
      const offset = (pagina - 1) * limite;
      
      let whereClause = "";
      const parametros = [];
      
      if (busqueda) {
        whereClause = "WHERE (nombre_categoria LIKE ? OR descripcion LIKE ?)";
        parametros.push(`%${busqueda}%`, `%${busqueda}%`);
      }
      
      // Consulta para obtener categorías
      const query = `
        SELECT 
          id_categoria,
          nombre_categoria,
          descripcion,
          (SELECT COUNT(*) FROM Productos p WHERE p.id_categoria = c.id_categoria) as total_productos
        FROM Categorias c
        ${whereClause}
        ORDER BY nombre_categoria ASC
        LIMIT ${limite} OFFSET ${offset}
      `;
      
      const categorias = await ejecutarQuery(query, parametros);
      
      // Consulta para contar total de registros
      const queryConteo = `
        SELECT COUNT(*) as total
        FROM Categorias c
        ${whereClause}
      `;
      
      const resultadoConteo = await ejecutarQuery(queryConteo, parametros);
      const total = resultadoConteo[0].total;
      
      return {
        categorias,
        paginacion: {
          paginaActual: pagina,
          totalPaginas: Math.ceil(total / limite),
          totalRegistros: total,
          registrosPorPagina: limite
        }
      };
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las categorías sin paginación (para selects)
   * @returns {Promise<Array>} - Lista de todas las categorías
   */
  static async obtenerTodasSimple() {
    try {
      const query = `
        SELECT 
          id_categoria,
          nombre_categoria,
          descripcion
        FROM Categorias
        ORDER BY nombre_categoria ASC
      `;
      
      return await ejecutarQuery(query);
    } catch (error) {
      console.error('Error al obtener categorías simples:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las categorías sin paginación con filtros de búsqueda
   * @param {string} busqueda - Término de búsqueda (opcional)
   * @returns {Promise<Array>} - Lista de todas las categorías que coinciden con la búsqueda
   */
  static async obtenerTodasSinPaginacion(busqueda = '') {
    try {
      let whereClause = "";
      const parametros = [];
      
      if (busqueda) {
        whereClause = "WHERE (nombre_categoria LIKE ? OR descripcion LIKE ?)";
        parametros.push(`%${busqueda}%`, `%${busqueda}%`);
      }
      
      const query = `
        SELECT 
          id_categoria,
          nombre_categoria,
          descripcion,
          (SELECT COUNT(*) FROM Productos p WHERE p.id_categoria = c.id_categoria) as total_productos
        FROM Categorias c
        ${whereClause}
        ORDER BY nombre_categoria ASC
      `;
      
      return await ejecutarQuery(query, parametros);
    } catch (error) {
      console.error('Error al obtener todas las categorías:', error);
      throw error;
    }
  }
}
