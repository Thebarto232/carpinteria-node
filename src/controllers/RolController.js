/**
 * Controlador de Roles
 * Maneja endpoints CRUD para la gestión de roles del sistema
 */

import { Rol } from "../models/Rol.js";
import { ResponseProvider } from "../providers/ResponseProvider.js";

export class RolController {
  
  /**
   * Obtiene todos los roles
   * GET /api/roles
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async obtenerRoles(req, res) {
    try {
      const roles = await Rol.obtenerTodos();

      return ResponseProvider.success(res, roles, 'Roles obtenidos exitosamente');

    } catch (error) {
      console.error('Error al obtener roles:', error);
      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene un rol por su ID
   * GET /api/roles/:id
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async obtenerRolPorId(req, res) {
    try {
      const { id } = req.params;
      const idRol = parseInt(id);

      if (!idRol || idRol < 1) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'id', 
          mensaje: 'ID de rol inválido' 
        }]);
      }

      const rol = await Rol.buscarPorId(idRol);

      if (!rol) {
        return ResponseProvider.noEncontrado(res, 'Rol');
      }

      return ResponseProvider.success(res, rol, 'Rol obtenido exitosamente');

    } catch (error) {
      console.error('Error al obtener rol:', error);
      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene un rol con sus permisos
   * GET /api/roles/:id/permisos
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async obtenerRolConPermisos(req, res) {
    try {
      const { id } = req.params;
      const idRol = parseInt(id);

      if (!idRol || idRol < 1) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'id', 
          mensaje: 'ID de rol inválido' 
        }]);
      }

      const rolConPermisos = await Rol.obtenerConPermisos(idRol);

      if (!rolConPermisos) {
        return ResponseProvider.noEncontrado(res, 'Rol');
      }

      return ResponseProvider.success(res, rolConPermisos, 'Rol con permisos obtenido exitosamente');

    } catch (error) {
      console.error('Error al obtener rol con permisos:', error);
      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Crea un nuevo rol
   * POST /api/roles
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async crearRol(req, res) {
    try {
      const { nombre_rol, descripcion } = req.body;

      // Validaciones básicas
      if (!nombre_rol || nombre_rol.trim().length < 2) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'nombre_rol', 
          mensaje: 'El nombre del rol debe tener al menos 2 caracteres' 
        }]);
      }

      if (!descripcion || descripcion.trim().length < 5) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'descripcion', 
          mensaje: 'La descripción debe tener al menos 5 caracteres' 
        }]);
      }

      const idRol = await Rol.crear({
        nombre_rol: nombre_rol.trim(),
        descripcion: descripcion.trim()
      });

      const rolCreado = await Rol.buscarPorId(idRol);

      return ResponseProvider.creado(res, rolCreado, 'Rol creado exitosamente');

    } catch (error) {
      console.error('Error al crear rol:', error);
      
      if (error.message.includes('ya existe')) {
        return ResponseProvider.conflicto(res, error.message);
      }

      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Actualiza un rol existente
   * PUT /api/roles/:id
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async actualizarRol(req, res) {
    try {
      const { id } = req.params;
      const { nombre_rol, descripcion } = req.body;
      const idRol = parseInt(id);

      if (!idRol || idRol < 1) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'id', 
          mensaje: 'ID de rol inválido' 
        }]);
      }

      // Validaciones básicas
      if (!nombre_rol || nombre_rol.trim().length < 2) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'nombre_rol', 
          mensaje: 'El nombre del rol debe tener al menos 2 caracteres' 
        }]);
      }

      if (!descripcion || descripcion.trim().length < 5) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'descripcion', 
          mensaje: 'La descripción debe tener al menos 5 caracteres' 
        }]);
      }

      const actualizado = await Rol.actualizar(idRol, {
        nombre_rol: nombre_rol.trim(),
        descripcion: descripcion.trim()
      });

      if (!actualizado) {
        return ResponseProvider.noEncontrado(res, 'Rol');
      }

      const rolActualizado = await Rol.buscarPorId(idRol);

      return ResponseProvider.success(res, rolActualizado, 'Rol actualizado exitosamente');

    } catch (error) {
      console.error('Error al actualizar rol:', error);
      
      if (error.message.includes('ya existe')) {
        return ResponseProvider.conflicto(res, error.message);
      }

      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Elimina un rol
   * DELETE /api/roles/:id
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async eliminarRol(req, res) {
    try {
      const { id } = req.params;
      const idRol = parseInt(id);

      if (!idRol || idRol < 1) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'id', 
          mensaje: 'ID de rol inválido' 
        }]);
      }

      // Verificar que no sea un rol del sistema (Administrador o Usuario)
      const rol = await Rol.buscarPorId(idRol);
      if (!rol) {
        return ResponseProvider.noEncontrado(res, 'Rol');
      }

      if (rol.nombre_rol === 'Administrador' || rol.nombre_rol === 'Usuario') {
        return ResponseProvider.error(
          res, 
          'No se pueden eliminar los roles del sistema (Administrador, Usuario)', 
          400
        );
      }

      const eliminado = await Rol.eliminar(idRol);

      if (!eliminado) {
        return ResponseProvider.error(res, 'No se pudo eliminar el rol', 500);
      }

      return ResponseProvider.success(res, null, 'Rol eliminado exitosamente');

    } catch (error) {
      console.error('Error al eliminar rol:', error);
      
      if (error.message.includes('tiene usuarios asignados')) {
        return ResponseProvider.error(res, error.message, 400);
      }

      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Asigna permisos a un rol
   * POST /api/roles/:id/permisos
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async asignarPermisos(req, res) {
    try {
      const { id } = req.params;
      const { permisos } = req.body;
      const idRol = parseInt(id);

      if (!idRol || idRol < 1) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'id', 
          mensaje: 'ID de rol inválido' 
        }]);
      }

      if (!Array.isArray(permisos)) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'permisos', 
          mensaje: 'Los permisos deben ser un array de IDs' 
        }]);
      }

      // Verificar que el rol existe
      const rol = await Rol.buscarPorId(idRol);
      if (!rol) {
        return ResponseProvider.noEncontrado(res, 'Rol');
      }

      // Actualizar permisos del rol
      await Rol.actualizarPermisos(idRol, permisos);

      // Obtener rol actualizado con permisos
      const rolActualizado = await Rol.obtenerConPermisos(idRol);

      return ResponseProvider.success(res, rolActualizado, 'Permisos asignados exitosamente');

    } catch (error) {
      console.error('Error al asignar permisos:', error);
      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Quita un permiso específico de un rol
   * DELETE /api/roles/:id/permisos/:idPermiso
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async quitarPermiso(req, res) {
    try {
      const { id, idPermiso } = req.params;
      const idRol = parseInt(id);
      const idPermisoNum = parseInt(idPermiso);

      if (!idRol || idRol < 1) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'id', 
          mensaje: 'ID de rol inválido' 
        }]);
      }

      if (!idPermisoNum || idPermisoNum < 1) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'idPermiso', 
          mensaje: 'ID de permiso inválido' 
        }]);
      }

      // Verificar que el rol existe
      const rol = await Rol.buscarPorId(idRol);
      if (!rol) {
        return ResponseProvider.noEncontrado(res, 'Rol');
      }

      const permisoQuitado = await Rol.quitarPermiso(idRol, idPermisoNum);

      if (!permisoQuitado) {
        return ResponseProvider.error(res, 'El rol no tenía ese permiso asignado', 400);
      }

      return ResponseProvider.success(res, null, 'Permiso quitado exitosamente');

    } catch (error) {
      console.error('Error al quitar permiso:', error);
      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }
}
