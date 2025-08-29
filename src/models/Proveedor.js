/**
 * Modelo de Proveedor para la gestión de proveedores
 * Maneja operaciones CRUD y validaciones relacionadas con proveedores
 */

import { ejecutarQuery } from "../utils/db.js";

export class Proveedor {
  
  /**
   * Busca un proveedor por su ID
   * @param {number} id - ID del proveedor
   * @returns {Promise<Object|null>} - Proveedor encontrado o null
   */
  static async buscarPorId(id) {
    try {
      const query = `
        SELECT 
          id_proveedor,
          nombre_proveedor,
          contacto_nombre,
          contacto_email,
          contacto_telefono,
          direccion_fiscal
        FROM Proveedores
        WHERE id_proveedor = ?
      `;
      
      const filas = await ejecutarQuery(query, [id]);
      return filas[0] || null;
    } catch (error) {
      console.error('Error al buscar proveedor por ID:', error);
      throw error;
    }
  }

  /**
   * Busca un proveedor por su email
   * @param {string} email - Email del proveedor
   * @returns {Promise<Object|null>} - Proveedor encontrado o null
   */
  static async buscarPorEmail(email) {
    try {
      const query = `
        SELECT 
          id_proveedor,
          nombre_proveedor,
          contacto_nombre,
          contacto_email,
          contacto_telefono,
          direccion_fiscal
        FROM Proveedores
        WHERE contacto_email = ?
      `;
      
      const filas = await ejecutarQuery(query, [email]);
      return filas[0] || null;
    } catch (error) {
      console.error('Error al buscar proveedor por email:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo proveedor en la base de datos
   * @param {Object} datosProveedor - Datos del proveedor
   * @param {string} datosProveedor.nombre_proveedor - Nombre del proveedor
   * @param {string} datosProveedor.contacto_nombre - Nombre del contacto (opcional)
   * @param {string} datosProveedor.contacto_email - Email del contacto (opcional)
   * @param {string} datosProveedor.contacto_telefono - Teléfono del contacto (opcional)
   * @param {string} datosProveedor.direccion_fiscal - Dirección fiscal (opcional)
   * @returns {Promise<number>} - ID del proveedor creado
   */
  static async crear({ 
    nombre_proveedor, 
    contacto_nombre = null, 
    contacto_email = null, 
    contacto_telefono = null, 
    direccion_fiscal = null 
  }) {
    try {
      // Verificar si el email ya existe
      if (contacto_email) {
        const proveedorExistente = await this.buscarPorEmail(contacto_email);
        if (proveedorExistente) {
          throw new Error('El email del proveedor ya existe');
        }
      }

      const query = `
        INSERT INTO Proveedores (
          nombre_proveedor, 
          contacto_nombre, 
          contacto_email, 
          contacto_telefono, 
          direccion_fiscal
        )
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const resultado = await ejecutarQuery(query, [
        nombre_proveedor, 
        contacto_nombre, 
        contacto_email, 
        contacto_telefono, 
        direccion_fiscal
      ]);
      
      return resultado.insertId;
    } catch (error) {
      console.error('Error al crear proveedor:', error);
      throw error;
    }
  }

  /**
   * Actualiza la información de un proveedor
   * @param {number} id - ID del proveedor
   * @param {Object} datosActualizar - Datos a actualizar
   * @returns {Promise<boolean>} - True si se actualizó correctamente
   */
  static async actualizar(id, datosActualizar) {
    try {
      const { 
        nombre_proveedor, 
        contacto_nombre, 
        contacto_email, 
        contacto_telefono, 
        direccion_fiscal 
      } = datosActualizar;
      
      // Verificar si el nuevo email ya existe en otro proveedor
      if (contacto_email) {
        const proveedorExistente = await this.buscarPorEmail(contacto_email);
        if (proveedorExistente && proveedorExistente.id_proveedor !== id) {
          throw new Error('El email del proveedor ya existe');
        }
      }
      
      const query = `
        UPDATE Proveedores 
        SET 
          nombre_proveedor = ?, 
          contacto_nombre = ?, 
          contacto_email = ?, 
          contacto_telefono = ?, 
          direccion_fiscal = ?
        WHERE id_proveedor = ?
      `;
      
      const resultado = await ejecutarQuery(query, [
        nombre_proveedor, 
        contacto_nombre, 
        contacto_email, 
        contacto_telefono, 
        direccion_fiscal, 
        id
      ]);
      
      return resultado.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar proveedor:', error);
      throw error;
    }
  }

  /**
   * Elimina un proveedor
   * @param {number} id - ID del proveedor
   * @returns {Promise<boolean>} - True si se eliminó correctamente
   */
  static async eliminar(id) {
    try {
      // Verificar si el proveedor tiene productos asociados
      const queryProductos = `
        SELECT COUNT(*) as total
        FROM Productos
        WHERE id_proveedor = ?
      `;
      
      const resultadoProductos = await ejecutarQuery(queryProductos, [id]);
      if (resultadoProductos[0].total > 0) {
        throw new Error('No se puede eliminar el proveedor porque tiene productos asociados');
      }

      const query = `
        DELETE FROM Proveedores 
        WHERE id_proveedor = ?
      `;
      
      const resultado = await ejecutarQuery(query, [id]);
      return resultado.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los proveedores con paginación
   * @param {number} pagina - Número de página
   * @param {number} limite - Límite de registros por página
   * @param {string} busqueda - Término de búsqueda (opcional)
   * @returns {Promise<Object>} - Proveedores y metadatos de paginación
   */
  static async obtenerTodos(pagina = 1, limite = 10, busqueda = '') {
    try {
      const offset = (pagina - 1) * limite;
      
      let whereClause = "";
      const parametros = [];
      
      if (busqueda) {
        whereClause = `WHERE (
          nombre_proveedor LIKE ? OR 
          contacto_nombre LIKE ? OR 
          contacto_email LIKE ? OR 
          contacto_telefono LIKE ? OR 
          direccion_fiscal LIKE ?
        )`;
        parametros.push(
          `%${busqueda}%`, 
          `%${busqueda}%`, 
          `%${busqueda}%`, 
          `%${busqueda}%`, 
          `%${busqueda}%`
        );
      }
      
      // Consulta para obtener proveedores
      const query = `
        SELECT 
          id_proveedor,
          nombre_proveedor,
          contacto_nombre,
          contacto_email,
          contacto_telefono,
          direccion_fiscal,
          (SELECT COUNT(*) FROM Productos p WHERE p.id_proveedor = pr.id_proveedor) as total_productos
        FROM Proveedores pr
        ${whereClause}
        ORDER BY nombre_proveedor ASC
        LIMIT ${limite} OFFSET ${offset}
      `;
      
      const proveedores = await ejecutarQuery(query, parametros);
      
      // Consulta para contar total de registros
      const queryConteo = `
        SELECT COUNT(*) as total
        FROM Proveedores pr
        ${whereClause}
      `;
      
      const resultadoConteo = await ejecutarQuery(queryConteo, parametros);
      const total = resultadoConteo[0].total;
      
      return {
        proveedores,
        paginacion: {
          paginaActual: pagina,
          totalPaginas: Math.ceil(total / limite),
          totalRegistros: total,
          registrosPorPagina: limite
        }
      };
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los proveedores sin paginación (para selects)
   * @returns {Promise<Array>} - Lista de todos los proveedores
   */
  static async obtenerTodosSimple() {
    try {
      const query = `
        SELECT 
          id_proveedor,
          nombre_proveedor,
          contacto_nombre,
          contacto_email,
          contacto_telefono
        FROM Proveedores
        ORDER BY nombre_proveedor ASC
      `;
      
      return await ejecutarQuery(query);
    } catch (error) {
      console.error('Error al obtener proveedores simples:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los proveedores sin paginación con información completa
   * @param {string} busqueda - Término de búsqueda (opcional)
   * @returns {Promise<Array>} - Lista de todos los proveedores
   */
  static async obtenerTodosSinPaginacion(busqueda = '') {
    try {
      let whereClause = "";
      const parametros = [];
      
      if (busqueda) {
        whereClause = `WHERE (
          nombre_proveedor LIKE ? OR 
          contacto_nombre LIKE ? OR 
          contacto_email LIKE ? OR 
          contacto_telefono LIKE ? OR 
          direccion_fiscal LIKE ?
        )`;
        parametros.push(
          `%${busqueda}%`, 
          `%${busqueda}%`, 
          `%${busqueda}%`, 
          `%${busqueda}%`, 
          `%${busqueda}%`
        );
      }
      
      const query = `
        SELECT 
          id_proveedor,
          nombre_proveedor,
          contacto_nombre,
          contacto_email,
          contacto_telefono,
          direccion_fiscal,
          (SELECT COUNT(*) FROM Productos p WHERE p.id_proveedor = pr.id_proveedor) as total_productos
        FROM Proveedores pr
        ${whereClause}
        ORDER BY nombre_proveedor ASC
      `;
      
      return await ejecutarQuery(query, parametros);
    } catch (error) {
      console.error('Error al obtener todos los proveedores:', error);
      throw error;
    }
  }
}
