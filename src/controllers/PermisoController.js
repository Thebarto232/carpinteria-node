/**
 * Controlador de Permisos
 * Maneja endpoints de consulta y verificación de permisos (SOLO LECTURA)
 */

import { Permiso } from "../models/Permiso.js";
import { ResponseProvider } from "../providers/ResponseProvider.js";

export class PermisoController {
  
  /**
   * Obtiene todos los permisos agrupados por módulo
   * GET /api/permisos
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async obtenerPermisos(req, res) {
    try {
      const permisos = await Permiso.obtenerTodos();

      return ResponseProvider.success(res, permisos, 'Permisos obtenidos exitosamente');

    } catch (error) {
      console.error('Error al obtener permisos:', error);
      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene todos los permisos como lista plana
   * GET /api/permisos/lista
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async obtenerPermisosLista(req, res) {
    try {
      const permisos = await Permiso.obtenerLista();

      return ResponseProvider.success(res, permisos, 'Lista de permisos obtenida exitosamente');

    } catch (error) {
      console.error('Error al obtener lista de permisos:', error);
      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene todos los módulos únicos
   * GET /api/permisos/modulos
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async obtenerModulos(req, res) {
    try {
      const modulos = await Permiso.obtenerModulos();

      return ResponseProvider.success(res, modulos, 'Módulos obtenidos exitosamente');

    } catch (error) {
      console.error('Error al obtener módulos:', error);
      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   * GET /api/permisos/verificar/:nombrePermiso
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async verificarPermisoUsuario(req, res) {
    try {
      const { nombrePermiso } = req.params;
      const idUsuario = req.usuario.id_usuario;

      if (!nombrePermiso || nombrePermiso.trim().length < 1) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'nombrePermiso', 
          mensaje: 'El nombre del permiso es obligatorio' 
        }]);
      }

      const tienePermiso = await Permiso.usuarioTienePermiso(idUsuario, nombrePermiso.trim());

      return ResponseProvider.success(res, {
        usuario_id: idUsuario,
        permiso: nombrePermiso.trim(),
        tiene_permiso: tienePermiso
      }, 'Verificación de permiso completada');

    } catch (error) {
      console.error('Error al verificar permiso de usuario:', error);
      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }
}
