/**
 * Modelo de Rol para la gestión de roles del sistema
 * Maneja operaciones CRUD y validaciones relacionadas con roles
 */

import { ejecutarQuery } from "../utils/db.js";

export class Rol {
  
  /**
   * Obtiene todos los roles
   * @returns {Promise<Array>} - Lista de roles
   */
  static async obtenerTodos() {
    try {
      const query = `
        SELECT 
          id_rol,
          nombre_rol,
          descripcion,
          fecha_creacion
        FROM Roles
        ORDER BY nombre_rol
      `;
      
      return await ejecutarQuery(query);
    } catch (error) {
      console.error('Error al obtener roles:', error);
      throw error;
    }
  }

  /**
   * Busca un rol por su ID
   * @param {number} id - ID del rol
   * @returns {Promise<Object|null>} - Rol encontrado o null
   */
  static async buscarPorId(id) {
    try {
      const query = `
        SELECT 
          id_rol,
          nombre_rol,
          descripcion,
          fecha_creacion
        FROM Roles
        WHERE id_rol = ?
      `;
      
      const filas = await ejecutarQuery(query, [id]);
      return filas[0] || null;
    } catch (error) {
      console.error('Error al buscar rol por ID:', error);
      throw error;
    }
  }

  /**
   * Busca un rol por su nombre
   * @param {string} nombreRol - Nombre del rol
   * @returns {Promise<Object|null>} - Rol encontrado o null
   */
  static async buscarPorNombre(nombreRol) {
    try {
      const query = `
        SELECT 
          id_rol,
          nombre_rol,
          descripcion,
          fecha_creacion
        FROM Roles
        WHERE nombre_rol = ?
      `;
      
      const filas = await ejecutarQuery(query, [nombreRol]);
      return filas[0] || null;
    } catch (error) {
      console.error('Error al buscar rol por nombre:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo rol
   * @param {Object} datosRol - Datos del rol
   * @param {string} datosRol.nombre_rol - Nombre del rol
   * @param {string} datosRol.descripcion - Descripción del rol
   * @returns {Promise<number>} - ID del rol creado
   */
  static async crear({ nombre_rol, descripcion }) {
    try {
      // Verificar si el nombre del rol ya existe
      const rolExistente = await this.buscarPorNombre(nombre_rol);
      if (rolExistente) {
        throw new Error('Ya existe un rol con ese nombre');
      }

      const query = `
        INSERT INTO Roles (nombre_rol, descripcion)
        VALUES (?, ?)
      `;
      
      const resultado = await ejecutarQuery(query, [nombre_rol, descripcion]);
      return resultado.insertId;
    } catch (error) {
      console.error('Error al crear rol:', error);
      throw error;
    }
  }

  /**
   * Actualiza un rol
   * @param {number} id - ID del rol
   * @param {Object} datosActualizar - Datos a actualizar
   * @returns {Promise<boolean>} - True si se actualizó correctamente
   */
  static async actualizar(id, datosActualizar) {
    try {
      const { nombre_rol, descripcion } = datosActualizar;
      
      // Verificar si el nuevo nombre ya existe (excluyendo el rol actual)
      const query = `
        SELECT id_rol FROM Roles 
        WHERE nombre_rol = ? AND id_rol != ?
      `;
      const rolConMismoNombre = await ejecutarQuery(query, [nombre_rol, id]);
      
      if (rolConMismoNombre.length > 0) {
        throw new Error('Ya existe un rol con ese nombre');
      }

      const queryActualizar = `
        UPDATE Roles 
        SET nombre_rol = ?, descripcion = ?
        WHERE id_rol = ?
      `;
      
      const resultado = await ejecutarQuery(queryActualizar, [nombre_rol, descripcion, id]);
      return resultado.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      throw error;
    }
  }

  /**
   * Elimina un rol (solo si no tiene usuarios asignados)
   * @param {number} id - ID del rol
   * @returns {Promise<boolean>} - True si se eliminó correctamente
   */
  static async eliminar(id) {
    try {
      // Verificar si el rol tiene usuarios asignados
      const queryUsuarios = `
        SELECT COUNT(*) as total
        FROM Usuarios
        WHERE id_rol = ?
      `;
      
      const resultadoUsuarios = await ejecutarQuery(queryUsuarios, [id]);
      const totalUsuarios = resultadoUsuarios[0].total;
      
      if (totalUsuarios > 0) {
        throw new Error('No se puede eliminar el rol porque tiene usuarios asignados');
      }

      // Eliminar permisos del rol
      await this.eliminarTodosLosPermisos(id);

      // Eliminar el rol
      const query = `
        DELETE FROM Roles
        WHERE id_rol = ?
      `;
      
      const resultado = await ejecutarQuery(query, [id]);
      return resultado.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      throw error;
    }
  }

  /**
   * Obtiene los permisos de un rol
   * @param {number} idRol - ID del rol
   * @returns {Promise<Array>} - Lista de permisos del rol
   */
  static async obtenerPermisos(idRol) {
    try {
      const query = `
        SELECT 
          p.id_permiso,
          p.nombre_permiso,
          p.descripcion,
          p.modulo
        FROM Roles_Permisos rp
        INNER JOIN Permisos p ON rp.id_permiso = p.id_permiso
        WHERE rp.id_rol = ?
        ORDER BY p.modulo, p.nombre_permiso
      `;
      
      return await ejecutarQuery(query, [idRol]);
    } catch (error) {
      console.error('Error al obtener permisos del rol:', error);
      throw error;
    }
  }

  /**
   * Asigna un permiso a un rol
   * @param {number} idRol - ID del rol
   * @param {number} idPermiso - ID del permiso
   * @returns {Promise<boolean>} - True si se asignó correctamente
   */
  static async asignarPermiso(idRol, idPermiso) {
    try {
      // Verificar si la relación ya existe
      const queryExiste = `
        SELECT COUNT(*) as total
        FROM Roles_Permisos
        WHERE id_rol = ? AND id_permiso = ?
      `;
      
      const resultadoExiste = await ejecutarQuery(queryExiste, [idRol, idPermiso]);
      
      if (resultadoExiste[0].total > 0) {
        return true; // Ya existe la relación
      }

      const query = `
        INSERT INTO Roles_Permisos (id_rol, id_permiso)
        VALUES (?, ?)
      `;
      
      const resultado = await ejecutarQuery(query, [idRol, idPermiso]);
      return resultado.affectedRows > 0;
    } catch (error) {
      console.error('Error al asignar permiso al rol:', error);
      throw error;
    }
  }

  /**
   * Quita un permiso de un rol
   * @param {number} idRol - ID del rol
   * @param {number} idPermiso - ID del permiso
   * @returns {Promise<boolean>} - True si se quitó correctamente
   */
  static async quitarPermiso(idRol, idPermiso) {
    try {
      const query = `
        DELETE FROM Roles_Permisos
        WHERE id_rol = ? AND id_permiso = ?
      `;
      
      const resultado = await ejecutarQuery(query, [idRol, idPermiso]);
      return resultado.affectedRows > 0;
    } catch (error) {
      console.error('Error al quitar permiso del rol:', error);
      throw error;
    }
  }

  /**
   * Actualiza todos los permisos de un rol
   * @param {number} idRol - ID del rol
   * @param {Array<number>} idsPermisos - IDs de los permisos a asignar
   * @returns {Promise<boolean>} - True si se actualizó correctamente
   */
  static async actualizarPermisos(idRol, idsPermisos) {
    try {
      // Eliminar todos los permisos actuales del rol
      await this.eliminarTodosLosPermisos(idRol);

      // Asignar los nuevos permisos
      if (idsPermisos && idsPermisos.length > 0) {
        const valores = idsPermisos.map(idPermiso => `(${idRol}, ${idPermiso})`).join(', ');
        const query = `
          INSERT INTO Roles_Permisos (id_rol, id_permiso)
          VALUES ${valores}
        `;
        
        await ejecutarQuery(query);
      }

      return true;
    } catch (error) {
      console.error('Error al actualizar permisos del rol:', error);
      throw error;
    }
  }

  /**
   * Elimina todos los permisos de un rol
   * @param {number} idRol - ID del rol
   * @returns {Promise<boolean>} - True si se eliminaron correctamente
   */
  static async eliminarTodosLosPermisos(idRol) {
    try {
      const query = `
        DELETE FROM Roles_Permisos
        WHERE id_rol = ?
      `;
      
      await ejecutarQuery(query, [idRol]);
      return true;
    } catch (error) {
      console.error('Error al eliminar permisos del rol:', error);
      throw error;
    }
  }

  /**
   * Obtiene el rol con sus permisos
   * @param {number} idRol - ID del rol
   * @returns {Promise<Object|null>} - Rol con permisos o null
   */
  static async obtenerConPermisos(idRol) {
    try {
      const rol = await this.buscarPorId(idRol);
      if (!rol) {
        return null;
      }

      const permisos = await this.obtenerPermisos(idRol);
      
      return {
        ...rol,
        permisos
      };
    } catch (error) {
      console.error('Error al obtener rol con permisos:', error);
      throw error;
    }
  }
}
