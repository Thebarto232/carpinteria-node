/**
 * Modelo de Permiso para la gestión de permisos del sistema
 * Maneja operaciones CRUD y validaciones relacionadas con permisos
 */

import { ejecutarQuery } from "../utils/db.js";

export class Permiso {
  
  /**
   * Obtiene todos los permisos agrupados por módulo
   * @returns {Promise<Object>} - Permisos agrupados por módulo
   */
  static async obtenerTodos() {
    try {
      const query = `
        SELECT 
          id_permiso,
          nombre_permiso,
          descripcion,
          modulo
        FROM Permisos
        ORDER BY modulo, nombre_permiso
      `;
      
      const permisos = await ejecutarQuery(query);
      
      // Agrupar por módulo
      const permisosPorModulo = permisos.reduce((acumulador, permiso) => {
        if (!acumulador[permiso.modulo]) {
          acumulador[permiso.modulo] = [];
        }
        acumulador[permiso.modulo].push(permiso);
        return acumulador;
      }, {});
      
      return permisosPorModulo;
    } catch (error) {
      console.error('Error al obtener permisos:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los permisos como lista plana
   * @returns {Promise<Array>} - Lista de permisos
   */
  static async obtenerLista() {
    try {
      const query = `
        SELECT 
          id_permiso,
          nombre_permiso,
          descripcion,
          modulo
        FROM Permisos
        ORDER BY modulo, nombre_permiso
      `;
      
      return await ejecutarQuery(query);
    } catch (error) {
      console.error('Error al obtener lista de permisos:', error);
      throw error;
    }
  }

  /**
   * Busca un permiso por su ID
   * @param {number} id - ID del permiso
   * @returns {Promise<Object|null>} - Permiso encontrado o null
   */
  static async buscarPorId(id) {
    try {
      const query = `
        SELECT 
          id_permiso,
          nombre_permiso,
          descripcion,
          modulo
        FROM Permisos
        WHERE id_permiso = ?
      `;
      
      const filas = await ejecutarQuery(query, [id]);
      return filas[0] || null;
    } catch (error) {
      console.error('Error al buscar permiso por ID:', error);
      throw error;
    }
  }

  /**
   * Busca un permiso por su nombre
   * @param {string} nombrePermiso - Nombre del permiso
   * @returns {Promise<Object|null>} - Permiso encontrado o null
   */
  static async buscarPorNombre(nombrePermiso) {
    try {
      const query = `
        SELECT 
          id_permiso,
          nombre_permiso,
          descripcion,
          modulo
        FROM Permisos
        WHERE nombre_permiso = ?
      `;
      
      const filas = await ejecutarQuery(query, [nombrePermiso]);
      return filas[0] || null;
    } catch (error) {
      console.error('Error al buscar permiso por nombre:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los módulos únicos
   * @returns {Promise<Array>} - Lista de módulos
   */
  static async obtenerModulos() {
    try {
      const query = `
        SELECT DISTINCT modulo
        FROM Permisos
        ORDER BY modulo
      `;
      
      const filas = await ejecutarQuery(query);
      return filas.map(fila => fila.modulo);
    } catch (error) {
      console.error('Error al obtener módulos:', error);
      throw error;
    }
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   * @param {number} idUsuario - ID del usuario
   * @param {string} nombrePermiso - Nombre del permiso a verificar
   * @returns {Promise<boolean>} - True si el usuario tiene el permiso
   */
  static async usuarioTienePermiso(idUsuario, nombrePermiso) {
    try {
      const query = `
        SELECT COUNT(*) as total
        FROM Usuarios u
        INNER JOIN Roles r ON u.id_rol = r.id_rol
        INNER JOIN Roles_Permisos rp ON r.id_rol = rp.id_rol
        INNER JOIN Permisos p ON rp.id_permiso = p.id_permiso
        WHERE u.id_usuario = ? 
          AND p.nombre_permiso = ? 
          AND u.estado = 'ACTIVO'
      `;
      
      const resultado = await ejecutarQuery(query, [idUsuario, nombrePermiso]);
      return resultado[0].total > 0;
    } catch (error) {
      console.error('Error al verificar permiso del usuario:', error);
      throw error;
    }
  }
}
